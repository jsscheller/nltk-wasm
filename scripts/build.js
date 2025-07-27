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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
