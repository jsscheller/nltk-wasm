import * as path from "path";
import { run } from "runish";

const OUT_DIR = path.resolve("./out");
const RELEASE_DIR = path.join(OUT_DIR, "release");
const { LIVE } = process.env;

async function main() {
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
