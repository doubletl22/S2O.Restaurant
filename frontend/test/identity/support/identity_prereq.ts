import "dotenv/config";
import axios, { AxiosInstance } from "axios";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { testData } from "../data/user_data";

type Logger = (message: string) => void;

type LoginResponse = {
  accessToken?: string;
  AccessToken?: string;
  user?: {
    id?: string;
    Id?: string;
    email?: string;
    Email?: string;
    fullName?: string;
    FullName?: string;
    roles?: string[];
    Roles?: string[];
  };
  User?: {
    id?: string;
    Id?: string;
    email?: string;
    Email?: string;
    fullName?: string;
    FullName?: string;
    roles?: string[];
    Roles?: string[];
  };
};

type UserRow = {
  id?: string;
  Id?: string;
  email?: string;
  Email?: string;
  fullName?: string;
  FullName?: string;
  roles?: string[];
  Roles?: string[];
  tenantId?: string | null;
  TenantId?: string | null;
  isLocked?: boolean;
  IsLocked?: boolean;
  isActive?: boolean;
  IsActive?: boolean;
};

type UsersResponse = {
  items?: UserRow[];
  Items?: UserRow[];
};

type TenantRow = {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  isLocked?: boolean;
  IsLocked?: boolean;
};

type BranchRow = {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  address?: string;
  Address?: string;
  phone?: string;
  Phone?: string;
};

type StaffRow = {
  id?: string;
  Id?: string;
  fullName?: string;
  FullName?: string;
  email?: string;
  Email?: string;
  phoneNumber?: string;
  PhoneNumber?: string;
  role?: string;
  Role?: string;
  branchId?: string;
  BranchId?: string;
  isActive?: boolean;
  IsActive?: boolean;
};

type ResultLike<T> = {
  value?: T;
  Value?: T;
  items?: T;
  Items?: T;
  isSuccess?: boolean;
  IsSuccess?: boolean;
  error?: {
    code?: string;
    description?: string;
    message?: string;
  };
  Error?: {
    code?: string;
    description?: string;
    message?: string;
  };
};

export type SharedPrerequisiteScope = "environment" | "owner" | "branch";

type SharedStepSnapshot = {
  requested: boolean;
  status: "skipped" | "ready";
  details: Record<string, unknown>;
};

export type SharedPrerequisiteSnapshot = {
  generatedAt: string;
  apiBaseUrl: string;
  scopesRequested: SharedPrerequisiteScope[];
  scopesResolved: SharedPrerequisiteScope[];
  steps: Record<SharedPrerequisiteScope, SharedStepSnapshot>;
};

export type SystemAdminDraft = {
  email: string;
  fullName: string;
  password: string;
};

export type RestaurantDraft = {
  restaurantName: string;
  ownerName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
};

export type StaffDraftSeed = {
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const planType = process.env.E2E_OWNER_PLAN_TYPE || "Free";
const branchSeed = {
  name: process.env.E2E_OWNER_BRANCH_NAME || "Chi nhanh E2E Seed",
  address: process.env.E2E_OWNER_BRANCH_ADDRESS || "123 Nguyen Hue, Q1, TP.HCM",
  phone: process.env.E2E_OWNER_BRANCH_PHONE || "0909000001",
};

const http: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEmail(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value?: string | null) {
  return String(value || "").trim();
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as any;
    const rawBody = typeof responseData === "string" ? responseData : JSON.stringify(responseData || {});

    if (rawBody.includes('relation "Tenants" does not exist') || rawBody.includes('relation "Branches" does not exist')) {
      return "Tenant service DB chua duoc migrate, dang thieu bang Tenants/Branches.";
    }

    return (
      responseData?.message ||
      responseData?.description ||
      responseData?.error?.message ||
      responseData?.error?.description ||
      error.message
    );
  }

  return error instanceof Error ? error.message : String(error);
}

function isTenantSchemaMissing(error: unknown) {
  return getErrorMessage(error).includes("Tenant service DB chua duoc migrate");
}

function getLoginToken(payload: LoginResponse) {
  return payload.accessToken || payload.AccessToken || "";
}

function getUserId(user: UserRow) {
  return String(user.id || user.Id || "");
}

function getUserEmail(user: UserRow) {
  return String(user.email || user.Email || "");
}

function getUserRoles(user: UserRow) {
  return user.roles || user.Roles || [];
}

function getUserTenantId(user: UserRow) {
  return String(user.tenantId || user.TenantId || "");
}

function isUserLocked(user: UserRow) {
  return Boolean(user.isLocked ?? user.IsLocked);
}

function isUserActive(user: UserRow) {
  return Boolean(user.isActive ?? user.IsActive ?? true);
}

function getTenantId(tenant: TenantRow) {
  return String(tenant.id || tenant.Id || "");
}

function getTenantName(tenant: TenantRow) {
  return String(tenant.name || tenant.Name || "");
}

function isTenantLocked(tenant: TenantRow) {
  return Boolean(tenant.isLocked ?? tenant.IsLocked);
}

function getBranchId(branch: BranchRow) {
  return String(branch.id || branch.Id || "");
}

function getStaffId(staff: StaffRow) {
  return String(staff.id || staff.Id || "");
}

function getStaffEmail(staff: StaffRow) {
  return String(staff.email || staff.Email || "");
}

function getStaffName(staff: StaffRow) {
  return String(staff.fullName || staff.FullName || "");
}

function getStaffPhone(staff: StaffRow) {
  return String(staff.phoneNumber || staff.PhoneNumber || "");
}

function getStaffRole(staff: StaffRow) {
  return String(staff.role || staff.Role || "");
}

function getStaffBranchId(staff: StaffRow) {
  return String(staff.branchId || staff.BranchId || "");
}

function isStaffActive(staff: StaffRow) {
  return Boolean(staff.isActive ?? staff.IsActive ?? true);
}

function pickItems<T>(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  const source = payload as any;
  if (Array.isArray(source?.items)) return source.items as T[];
  if (Array.isArray(source?.Items)) return source.Items as T[];
  if (Array.isArray(source?.value)) return source.value as T[];
  if (Array.isArray(source?.Value)) return source.Value as T[];
  return [] as T[];
}

function decodeJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const payload = parts[1];
  const pad = "=".repeat((4 - (payload.length % 4)) % 4);
  const base64 = `${payload}${pad}`.replace(/-/g, "+").replace(/_/g, "/");

  try {
    return JSON.parse(Buffer.from(base64, "base64").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getTenantIdFromToken(token: string) {
  const payload = decodeJwtPayload(token);
  const tenantId = payload?.tenant_id || payload?.tenantId || payload?.TenantId;
  return tenantId ? String(tenantId) : "";
}

function logWith(logger: Logger | undefined, message: string) {
  logger?.(message);
}

function writeSnapshot(snapshotPath: string, snapshot: SharedPrerequisiteSnapshot) {
  mkdirSync(dirname(snapshotPath), { recursive: true });
  writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), "utf8");
}

async function login(email: string, password: string) {
  const response = await http.post<LoginResponse>("/api/v1/auth/login", { email, password });
  const token = getLoginToken(response.data);

  if (!token) {
    throw new Error("Login thanh cong nhung khong nhan duoc access token.");
  }

  return token;
}

async function tryLogin(email: string, password: string) {
  try {
    return await login(email, password);
  } catch {
    return null;
  }
}

async function loginAdmin() {
  return login(testData.admin.email, testData.admin.password);
}

async function findUserByEmail(adminToken: string, email: string) {
  const response = await http.get<UsersResponse>("/api/users", {
    headers: authHeaders(adminToken),
    params: {
      keyword: email,
      page: 1,
      size: 100,
    },
  });

  const items = pickItems<UserRow>(response.data);
  return items.find((item) => normalizeEmail(getUserEmail(item)) === normalizeEmail(email)) || null;
}

async function waitForUserByEmail(adminToken: string, email: string) {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    const user = await findUserByEmail(adminToken, email);
    if (user) {
      return user;
    }

    await wait(1000);
  }

  throw new Error(`Khong tim thay user "${email}" sau khi tao prerequisite.`);
}

async function createSystemAdmin(adminToken: string, adminDraft: SystemAdminDraft) {
  await http.post(
    "/api/users",
    {
      email: adminDraft.email,
      fullName: adminDraft.fullName,
      password: adminDraft.password,
      role: "SystemAdmin",
    },
    {
      headers: authHeaders(adminToken),
    }
  );
}

async function updateUserRole(adminToken: string, userId: string, newRole: string) {
  await http.put(
    `/api/users/${userId}/role`,
    { userId, newRole },
    { headers: authHeaders(adminToken) }
  );
}

async function lockUser(adminToken: string, userId: string) {
  await http.post(`/api/users/${userId}/lock`, {}, { headers: authHeaders(adminToken) });
}

async function unlockUser(adminToken: string, userId: string) {
  await http.post(`/api/users/${userId}/unlock`, {}, { headers: authHeaders(adminToken) });
}

async function resetUserPassword(adminToken: string, userId: string, newPassword: string) {
  await http.put(`/api/users/${userId}/reset-password`, JSON.stringify(newPassword), {
    headers: authHeaders(adminToken),
  });
}

async function listTenants(adminToken: string, keyword?: string) {
  const response = await http.get<ResultLike<TenantRow[]>>("/api/v1/tenants", {
    headers: authHeaders(adminToken),
    params: keyword ? { keyword } : undefined,
  });

  return pickItems<TenantRow>(response.data);
}

async function waitForTenantByName(adminToken: string, tenantName: string) {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    const tenant = await findTenantByName(adminToken, tenantName);
    if (tenant) {
      return tenant;
    }

    await wait(1000);
  }

  throw new Error(`Khong tim thay tenant "${tenantName}" sau khi tao prerequisite.`);
}

function findTenantApiContainerName() {
  try {
    const output = execSync('docker ps --format "{{.Names}}\t{{.Ports}}"', {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    const rows = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name = "", ports = ""] = line.split("\t");
        return { name, ports };
      });

    return (
      rows.find((row) => /tenant-api/i.test(row.name) && row.ports.includes("5004->"))?.name ||
      rows.find((row) => /tenant-api/i.test(row.name))?.name ||
      ""
    );
  } catch {
    return "";
  }
}

async function waitForTenantService(adminToken: string, logger?: Logger) {
  const deadline = Date.now() + 120000;
  let lastMessage = "";

  while (Date.now() < deadline) {
    try {
      await listTenants(adminToken);
      logWith(logger, "Tenant service da san sang va doc duoc danh sach tenant.");
      return;
    } catch (error) {
      lastMessage = getErrorMessage(error);
      await wait(3000);
    }
  }

  throw new Error(`Da restart tenant-api nhung tenant service van chua san sang. Loi cuoi: ${lastMessage}`);
}

async function ensureTenantServiceReady(adminToken: string, logger?: Logger) {
  try {
    await listTenants(adminToken);
    return;
  } catch (error) {
    if (!isTenantSchemaMissing(error)) {
      throw error;
    }
  }

  const containerName = findTenantApiContainerName();
  if (!containerName) {
    throw new Error(
      "Tenant service DB chua duoc migrate va script khong tim thay container tenant-api de tu restart."
    );
  }

  logWith(logger, `Phat hien tenant DB chua migrate. Dang restart container "${containerName}" de chay lai migration.`);
  execSync(`docker restart ${containerName}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  await waitForTenantService(adminToken, logger);
}

async function findTenantById(adminToken: string, tenantId: string) {
  const tenants = await listTenants(adminToken, tenantId);
  return tenants.find((tenant) => getTenantId(tenant) === tenantId) || null;
}

async function findTenantByName(adminToken: string, tenantName: string) {
  const tenants = await listTenants(adminToken, tenantName);
  return tenants.find((tenant) => normalizeText(getTenantName(tenant)) === normalizeText(tenantName)) || null;
}

async function setTenantLockState(adminToken: string, tenantId: string, shouldLock: boolean) {
  const action = shouldLock ? "lock" : "unlock";
  await http.post(`/api/v1/tenants/${tenantId}/${action}`, {}, { headers: authHeaders(adminToken) });
}

async function registerTenant(restaurantDraft: RestaurantDraft) {
  await http.post("/api/v1/tenants/registration", {
    restaurantName: restaurantDraft.restaurantName,
    ownerName: restaurantDraft.ownerName,
    email: restaurantDraft.email,
    password: restaurantDraft.password,
    address: restaurantDraft.address,
    phoneNumber: restaurantDraft.phoneNumber,
    planType,
  });
}

async function registerSeedTenant() {
  return registerTenant({
    restaurantName: testData.newTenant.restaurantName,
    ownerName: testData.newTenant.ownerName,
    email: testData.newTenant.email,
    password: testData.newTenant.password,
    address: testData.newTenant.address,
    phoneNumber: testData.newTenant.phoneNumber,
  });
}

async function listBranches(ownerToken: string) {
  const response = await http.get<BranchRow[] | ResultLike<BranchRow[]>>("/api/v1/branches", {
    headers: authHeaders(ownerToken),
  });

  return pickItems<BranchRow>(response.data);
}

async function createBranch(ownerToken: string, tenantId: string) {
  await http.post(
    "/api/v1/branches",
    {
      tenantId,
      name: branchSeed.name,
      address: branchSeed.address,
      phone: branchSeed.phone,
    },
    {
      headers: authHeaders(ownerToken),
    }
  );
}

async function ensureOwnerToken(adminToken: string, logger?: Logger) {
  const ownerToken = await tryLogin(testData.owner.email, testData.owner.password);
  if (ownerToken) {
    logWith(logger, `Owner test "${testData.owner.email}" da dang nhap duoc.`);
    return ownerToken;
  }

  logWith(logger, `Owner test "${testData.owner.email}" chua san sang. Bat dau kiem tra bang admin.`);

  const existingOwner = await findUserByEmail(adminToken, testData.owner.email);
  if (!existingOwner) {
    logWith(logger, "Khong tim thay Owner test. Dang tao tenant/owner seed.");
    try {
      await registerSeedTenant();
    } catch (error) {
      const createdOwnerToken = await tryLogin(testData.owner.email, testData.owner.password);
      if (createdOwnerToken) {
        logWith(logger, "Dang ky tenant bao loi nhung Owner da duoc tao. Tiep tuc kiem tra prerequisite.");
        return createdOwnerToken;
      }

      throw error;
    }

    const createdOwnerToken = await tryLogin(testData.owner.email, testData.owner.password);
    if (!createdOwnerToken) {
      throw new Error("Da tao tenant/owner seed nhung Owner van khong dang nhap duoc.");
    }

    return createdOwnerToken;
  }

  const ownerId = getUserId(existingOwner);
  if (!ownerId) {
    throw new Error("Tim thay Owner test nhung khong lay duoc user id.");
  }

  if (!isUserActive(existingOwner)) {
    throw new Error("Owner test ton tai nhung dang bi vo hieu hoa. Script khong tu mo lai user inactive.");
  }

  if (!getUserRoles(existingOwner).includes("RestaurantOwner")) {
    logWith(logger, "Owner test ton tai nhung sai role. Dang chuyen role ve RestaurantOwner.");
    await updateUserRole(adminToken, ownerId, "RestaurantOwner");
  }

  if (isUserLocked(existingOwner)) {
    logWith(logger, "Owner test dang bi khoa. Dang mo khoa user.");
    await unlockUser(adminToken, ownerId);
  }

  const tenantId = getUserTenantId(existingOwner);
  if (tenantId) {
    const tenant = await findTenantById(adminToken, tenantId);
    if (tenant && isTenantLocked(tenant)) {
      logWith(logger, "Tenant cua Owner test dang bi khoa. Dang mo khoa tenant.");
      await setTenantLockState(adminToken, tenantId, false);
    }
  }

  logWith(logger, "Dang reset mat khau Owner test ve gia tri trong user_data.ts.");
  await resetUserPassword(adminToken, ownerId, testData.owner.password);

  const repairedOwnerToken = await tryLogin(testData.owner.email, testData.owner.password);
  if (!repairedOwnerToken) {
    throw new Error("Da thu sua Owner test nhung van khong dang nhap duoc.");
  }

  return repairedOwnerToken;
}

async function ensureAtLeastOneBranch(ownerToken: string, logger?: Logger) {
  const branches = await listBranches(ownerToken);
  if (branches.length > 0) {
    logWith(logger, `Owner hien co ${branches.length} branch. Khong tao them.`);
    return branches;
  }

  const tenantId = getTenantIdFromToken(ownerToken);
  if (!tenantId) {
    throw new Error("Khong doc duoc tenant_id tu token Owner de tao branch.");
  }

  logWith(logger, "Owner chua co branch nao. Dang tao branch seed.");
  await createBranch(ownerToken, tenantId);

  const updatedBranches = await listBranches(ownerToken);
  if (updatedBranches.length === 0) {
    throw new Error("Da goi tao branch seed nhung van khong doc thay branch nao.");
  }

  logWith(logger, `Da dam bao Owner co it nhat 1 branch. Branch hien co: ${updatedBranches.length}.`);
  return updatedBranches;
}

async function listStaff(ownerToken: string) {
  const response = await http.get<StaffRow[] | ResultLike<StaffRow[]>>("/api/v1/staff", {
    headers: authHeaders(ownerToken),
  });

  return pickItems<StaffRow>(response.data);
}

async function findStaffByEmail(ownerToken: string, email: string) {
  const staffs = await listStaff(ownerToken);
  return staffs.find((staff) => normalizeEmail(getStaffEmail(staff)) === normalizeEmail(email)) || null;
}

async function waitForStaffByEmail(ownerToken: string, email: string) {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    const staff = await findStaffByEmail(ownerToken, email);
    if (staff) {
      return staff;
    }

    await wait(1000);
  }

  throw new Error(`Khong tim thay staff "${email}" sau khi tao prerequisite.`);
}

async function createStaffRecord(
  ownerToken: string,
  payload: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    branchId: string;
    role: string;
  }
) {
  await http.post("/api/v1/staff", payload, {
    headers: authHeaders(ownerToken),
  });
}

async function updateStaffRecord(
  ownerToken: string,
  staffId: string,
  payload: {
    email: string;
    fullName: string;
    phoneNumber: string;
    branchId: string;
    role: string;
    isActive: boolean;
    password?: string;
  }
) {
  await http.put(
    `/api/v1/staff/${staffId}`,
    {
      userId: staffId,
      email: payload.email,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      branchId: payload.branchId,
      role: payload.role,
      isActive: payload.isActive,
      password: payload.password ?? null,
    },
    {
      headers: authHeaders(ownerToken),
    }
  );
}

function expandSharedScopes(scopes: SharedPrerequisiteScope[]) {
  const resolved = new Set<SharedPrerequisiteScope>();

  if (scopes.includes("environment")) {
    resolved.add("environment");
  }

  if (scopes.includes("owner")) {
    resolved.add("environment");
    resolved.add("owner");
  }

  if (scopes.includes("branch")) {
    resolved.add("environment");
    resolved.add("owner");
    resolved.add("branch");
  }

  return ["environment", "owner", "branch"].filter((scope) =>
    resolved.has(scope as SharedPrerequisiteScope)
  ) as SharedPrerequisiteScope[];
}

export async function prepareIdentitySharedPrerequisites(options?: {
  scopes?: SharedPrerequisiteScope[];
  logger?: Logger;
  snapshotPath?: string;
}) {
  const requestedScopes: SharedPrerequisiteScope[] = options?.scopes?.length ? options.scopes : ["branch"];
  const resolvedScopes = expandSharedScopes(requestedScopes);
  const logger = options?.logger;
  const snapshot: SharedPrerequisiteSnapshot = {
    generatedAt: new Date().toISOString(),
    apiBaseUrl,
    scopesRequested: requestedScopes,
    scopesResolved: resolvedScopes,
    steps: {
      environment: {
        requested: requestedScopes.includes("environment"),
        status: "skipped",
        details: {},
      },
      owner: {
        requested: requestedScopes.includes("owner"),
        status: "skipped",
        details: {},
      },
      branch: {
        requested: requestedScopes.includes("branch"),
        status: "skipped",
        details: {},
      },
    },
  };

  let adminToken = "";
  let ownerToken = "";

  if (resolvedScopes.includes("environment")) {
    adminToken = await loginAdmin();
    await ensureTenantServiceReady(adminToken, logger);
    snapshot.steps.environment = {
      requested: snapshot.steps.environment.requested,
      status: "ready",
      details: {
        adminEmail: testData.admin.email,
        tenantServiceReady: true,
      },
    };
  }

  if (resolvedScopes.includes("owner")) {
    if (!adminToken) {
      adminToken = await loginAdmin();
    }

    ownerToken = await ensureOwnerToken(adminToken, logger);
    const owner = await findUserByEmail(adminToken, testData.owner.email);

    snapshot.steps.owner = {
      requested: snapshot.steps.owner.requested,
      status: "ready",
      details: {
        ownerEmail: testData.owner.email,
        ownerTenantId: owner ? getUserTenantId(owner) : "",
        ownerCanLogin: Boolean(ownerToken),
      },
    };
  }

  if (resolvedScopes.includes("branch")) {
    if (!adminToken) {
      adminToken = await loginAdmin();
    }

    if (!ownerToken) {
      ownerToken = await ensureOwnerToken(adminToken, logger);
    }

    const branches = await ensureAtLeastOneBranch(ownerToken, logger);
    snapshot.steps.branch = {
      requested: snapshot.steps.branch.requested,
      status: "ready",
      details: {
        ownerEmail: testData.owner.email,
        branchCount: branches.length,
        seedBranchName: branchSeed.name,
        firstBranchId: branches[0] ? getBranchId(branches[0]) : "",
      },
    };
  }

  if (options?.snapshotPath) {
    writeSnapshot(options.snapshotPath, snapshot);
  }

  return {
    adminToken,
    ownerToken,
    snapshot,
  };
}

export async function ensureSystemAdminDraft(
  adminDraft: SystemAdminDraft,
  options?: {
    resetPasswordTo?: string;
    isLocked?: boolean;
    logger?: Logger;
  }
) {
  const adminToken = await loginAdmin();
  let user = await findUserByEmail(adminToken, adminDraft.email);

  if (!user) {
    logWith(options?.logger, `Dang tao admin prerequisite "${adminDraft.email}".`);

    try {
      await createSystemAdmin(adminToken, adminDraft);
    } catch (error) {
      const fallbackUser = await findUserByEmail(adminToken, adminDraft.email);
      if (!fallbackUser) {
        throw error;
      }
    }

    user = await waitForUserByEmail(adminToken, adminDraft.email);
  }

  const userId = getUserId(user);
  if (!userId) {
    throw new Error(`Khong lay duoc user id cua admin prerequisite "${adminDraft.email}".`);
  }

  if (!getUserRoles(user).includes("SystemAdmin")) {
    await updateUserRole(adminToken, userId, "SystemAdmin");
  }

  if (options?.resetPasswordTo) {
    await resetUserPassword(adminToken, userId, options.resetPasswordTo);
  }

  if (typeof options?.isLocked === "boolean") {
    if (options.isLocked && !isUserLocked(user)) {
      await lockUser(adminToken, userId);
    }

    if (!options.isLocked && isUserLocked(user)) {
      await unlockUser(adminToken, userId);
    }
  }

  return waitForUserByEmail(adminToken, adminDraft.email);
}

export async function ensureRestaurantDraft(
  restaurantDraft: RestaurantDraft,
  options?: {
    isLocked?: boolean;
    logger?: Logger;
  }
) {
  const { adminToken } = await prepareIdentitySharedPrerequisites({
    scopes: ["environment"],
    logger: options?.logger,
  });

  let tenant = await findTenantByName(adminToken, restaurantDraft.restaurantName);

  if (!tenant) {
    logWith(options?.logger, `Dang tao tenant prerequisite "${restaurantDraft.restaurantName}".`);

    try {
      await registerTenant(restaurantDraft);
    } catch (error) {
      const fallbackTenant = await findTenantByName(adminToken, restaurantDraft.restaurantName);
      if (!fallbackTenant) {
        throw error;
      }
    }

    tenant = await waitForTenantByName(adminToken, restaurantDraft.restaurantName);
  }

  const tenantId = getTenantId(tenant);
  if (!tenantId) {
    throw new Error(`Khong lay duoc tenant id cua prerequisite "${restaurantDraft.restaurantName}".`);
  }

  if (typeof options?.isLocked === "boolean" && isTenantLocked(tenant) !== options.isLocked) {
    await setTenantLockState(adminToken, tenantId, options.isLocked);
    tenant = (await findTenantById(adminToken, tenantId)) || tenant;
  }

  return tenant;
}

export async function ensureStaffDraft(
  staffDraft: StaffDraftSeed,
  options?: {
    fullName?: string;
    phoneNumber?: string;
    role?: string;
    branchId?: string;
    isActive?: boolean;
    password?: string;
    logger?: Logger;
  }
) {
  const { ownerToken } = await prepareIdentitySharedPrerequisites({
    scopes: ["branch"],
    logger: options?.logger,
  });

  const branches = await listBranches(ownerToken);
  const fallbackBranchId = branches[0] ? getBranchId(branches[0]) : "";
  const branchId = options?.branchId || fallbackBranchId;
  if (!branchId) {
    throw new Error("Khong co branch nao san sang de tao prerequisite staff.");
  }

  const expectedFullName = options?.fullName || staffDraft.fullName;
  const expectedPhoneNumber = options?.phoneNumber || staffDraft.phoneNumber;
  const expectedRole = options?.role || "Waiter";
  const expectedIsActive = options?.isActive ?? true;
  const expectedPassword = options?.password || staffDraft.password;

  let staff = await findStaffByEmail(ownerToken, staffDraft.email);

  if (!staff) {
    logWith(options?.logger, `Dang tao staff prerequisite "${staffDraft.email}".`);

    try {
      await createStaffRecord(ownerToken, {
        email: staffDraft.email,
        password: expectedPassword,
        fullName: expectedFullName,
        phoneNumber: expectedPhoneNumber,
        branchId,
        role: expectedRole,
      });
    } catch (error) {
      const fallbackStaff = await findStaffByEmail(ownerToken, staffDraft.email);
      if (!fallbackStaff) {
        throw error;
      }
    }

    staff = await waitForStaffByEmail(ownerToken, staffDraft.email);
  }

  const staffId = getStaffId(staff);
  if (!staffId) {
    throw new Error(`Khong lay duoc staff id cua prerequisite "${staffDraft.email}".`);
  }

  const shouldUpdate =
    normalizeText(getStaffName(staff)) !== normalizeText(expectedFullName) ||
    normalizeText(getStaffPhone(staff)) !== normalizeText(expectedPhoneNumber) ||
    normalizeText(getStaffRole(staff)) !== normalizeText(expectedRole) ||
    normalizeText(getStaffBranchId(staff)) !== normalizeText(branchId) ||
    isStaffActive(staff) !== expectedIsActive;

  if (shouldUpdate) {
    await updateStaffRecord(ownerToken, staffId, {
      email: staffDraft.email,
      fullName: expectedFullName,
      phoneNumber: expectedPhoneNumber,
      branchId,
      role: expectedRole,
      isActive: expectedIsActive,
    });
  }

  return waitForStaffByEmail(ownerToken, staffDraft.email);
}

export function formatPrerequisiteError(error: unknown) {
  return getErrorMessage(error);
}

export function getIdentityApiBaseUrl() {
  return apiBaseUrl;
}
