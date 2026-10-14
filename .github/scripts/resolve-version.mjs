import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";

function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${name}=${value}\n`);
  }
}

const inputVersion = process.env.INPUT_VERSION?.trim();
if (inputVersion) {
  const version = inputVersion.replace(/^v/, "");
  console.log(`Using input version: ${version}`);
  setOutput("version", version);
  process.exit(0);
}

const ref = process.env.GITHUB_REF || "";
if (ref.startsWith("refs/tags/v")) {
  const version = ref.replace(/^refs\/tags\/v/, "");
  console.log(`Using git tag version: ${version}`);
  setOutput("version", version);
  process.exit(0);
}

// 自动探测 upstream main 的最新正式版本 tag
try {
  const output = execSync(
    'git ls-remote --tags --refs https://github.com/mountain-loop/yaak.git "v*"',
    { encoding: "utf8", timeout: 20000 },
  );
  const tags = output
    .split("\n")
    .map((line) => line.split("\t")[1]?.replace("refs/tags/", ""))
    .filter(Boolean)
    .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const latestTag = tags[tags.length - 1];
  if (latestTag) {
    const version = latestTag.replace(/^v/, "");
    console.log(`Resolved upstream main version: ${version}`);
    setOutput("version", version);
    process.exit(0);
  }
} catch (e) {
  console.warn("Failed to fetch upstream tags:", e.message);
}

// 回退默认主线版本
const fallback = "2026.9.0";
console.log(`Falling back to default version: ${fallback}`);
setOutput("version", fallback);
