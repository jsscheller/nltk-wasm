import * as path from "path";
import * as fs from "fs/promises";
import { run } from "runish";
import esbuild from "esbuild";

const OUT_DIR = path.resolve("./out");
const RELEASE_DIR = path.join(OUT_DIR, "release");
const TSC = path.resolve("node_modules/typescript/bin/tsc");
const { RELEASE } = process.env;

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  await run(TSC, [
    "--declaration",
    "--emitDeclarationOnly",
    "--outDir",
    path.join(OUT_DIR, "types"),
  ]);

  await esbuild.build({
    entryPoints: ["src/index.ts"],
    outdir: OUT_DIR,
    bundle: true,
    write: true,
    format: "esm",
    target: "es2020",
    minify: !!RELEASE,
  });

  if (!RELEASE) return;

  await fs.rm(RELEASE_DIR, { force: true, recursive: true });
  await fs.mkdir(RELEASE_DIR, { recursive: true });

  const files = [
    "out/*.pickle",
    "out/*.whl",
    "out/pyodide*",
    "out/python_stdlib.zip",
    "out/sqlite3-1.0.0.zip",
    "out/types",
    "out/index.js",
    "package.json",
    "README.md",
    "LICENSE",
  ];
  for (const glob of files) {
    for await (const filePath of fs.glob(glob)) {
      await fs.cp(filePath, path.join(RELEASE_DIR, path.basename(filePath)), {
        recursive: true,
      });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
