import * as path from "path";
import * as fs from "fs/promises";
import { run } from "runish";

const OUT_DIR = path.resolve("./out");
const RELEASE_DIR = path.join(OUT_DIR, "release");
const { LIVE } = process.env;

async function main() {
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

  const otp = process.argv.find((x) => x.startsWith("--otp="));
  await run(
    "npm",
    ["publish", "--access=public"].concat(LIVE ? [otp] : ["--dry-run"]),
    { cwd: RELEASE_DIR },
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
