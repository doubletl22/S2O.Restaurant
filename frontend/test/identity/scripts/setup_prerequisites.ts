import { resolve } from "node:path";
import {
  formatPrerequisiteError,
  getIdentityApiBaseUrl,
  prepareIdentitySharedPrerequisites,
  SharedPrerequisiteScope,
} from "../support/identity_prereq";

const snapshotPath = resolve(process.cwd(), "output", "identity_prereq_snapshot.json");
const validScopes: SharedPrerequisiteScope[] = ["environment", "owner", "branch"];

function log(message: string) {
  console.log(`[identity-prereq] ${message}`);
}

function parseScopes(argv: string[]) {
  const scopeArg = argv.find((value) => value.startsWith("--scope="));
  if (!scopeArg) {
    return ["branch"] as SharedPrerequisiteScope[];
  }

  const rawScopes = scopeArg
    .slice("--scope=".length)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (rawScopes.length === 0) {
    return ["branch"] as SharedPrerequisiteScope[];
  }

  const invalidScopes = rawScopes.filter((value) => !validScopes.includes(value as SharedPrerequisiteScope));
  if (invalidScopes.length > 0) {
    throw new Error(
      `Scope khong hop le: ${invalidScopes.join(", ")}. Chi ho tro: ${validScopes.join(", ")}.`
    );
  }

  return rawScopes as SharedPrerequisiteScope[];
}

async function main() {
  const scopes = parseScopes(process.argv.slice(2));

  log(`API base URL: ${getIdentityApiBaseUrl()}`);
  log(`Dang chay prerequisite theo scope: ${scopes.join(" -> ")}`);

  try {
    const result = await prepareIdentitySharedPrerequisites({
      scopes,
      logger: log,
      snapshotPath,
    });

    const steps = result.snapshot.steps;
    const readySteps = Object.entries(steps)
      .filter(([, step]) => step.status === "ready")
      .map(([name]) => name)
      .join(", ");

    log(`Prerequisite Identity E2E da san sang. Cac buoc ready: ${readySteps}.`);
    log(`Da luu snapshot prerequisite tai: ${snapshotPath}`);
  } catch (error) {
    const message = formatPrerequisiteError(error);
    log(`That bai: ${message}`);
    if (message.includes("Tenant service DB chua duoc migrate")) {
      log("Can chay migration/init database cho tenant service truoc khi chay full suite.");
    }
    process.exitCode = 1;
  }
}

void main();
