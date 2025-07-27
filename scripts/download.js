import * as path from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import AdmZip from "adm-zip";

const OUT_DIR = path.resolve("./out");

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const assets = [
    "pyodide.js",
    "python_stdlib.zip",
    "pyodide.asm.wasm",
    "pyodide-lock.json",
    "pyodide.asm.js",
    "nltk-3.8.1-py3-none-any.whl",
    "regex-2024.4.16-cp312-cp312-pyodide_2024_0_wasm32.whl",
    "sqlite3-1.0.0.zip",
  ];
  for (const name of assets) {
    let url = `https://cdn.jsdelivr.net/pyodide/v0.26.4/full/${name}`;
    if (name === "pyodide.js") url = url.replace(/.js$/, () => ".mjs");
    await download(name, url);
  }

  await download(
    "punkt.zip",
    "https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/tokenizers/punkt.zip",
  );

  const punktPath = path.join(OUT_DIR, "punkt.zip");
  const zip = new AdmZip(punktPath);
  for (const ent of zip.getEntries()) {
    if (ent.entryName.endsWith(".pickle")) {
      zip.extractEntryTo(ent.entryName, OUT_DIR, false, true);
    }
  }
}

async function download(name, url) {
  const filePath = path.join(OUT_DIR, name);

  if (existsSync(filePath)) return;

  console.log(`downloading ${name} - ${url}`);
  const buf = await fetch(url).then((x) => x.arrayBuffer());
  await fs.writeFile(filePath, Buffer.from(buf));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
