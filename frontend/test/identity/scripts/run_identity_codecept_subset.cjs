"use strict";

const run = require("codeceptjs/lib/command/run");

const tests = process.argv.slice(2).filter(Boolean);

if (tests.length === 0) {
  console.error("[identity-suite] Khong nhan duoc file test nao de chay.");
  process.exit(1);
}

const options = {
  ai: false,
  config: undefined,
  debug: false,
  override: JSON.stringify({ tests }),
  profile: undefined,
  steps: true,
  verbose: false,
};

run(undefined, options)
  .then(() => {
    if (typeof process.exitCode === "number" && process.exitCode !== 0) {
      process.exit(process.exitCode);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
