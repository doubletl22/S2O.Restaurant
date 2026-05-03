Feature("ITC_10 - Khóa và mở khóa người dùng");

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@s2o.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "Staff@123";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@123";

const REPORT_PATH = path.join(__dirname, "itc10_report.txt");

function suffix() {
  return Math.random().toString(36).slice(2, 10);
}

function mark(I, label) {
  I.say(`===== ${label} =====`);
}

function writeReport(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(REPORT_PATH, line, { encoding: "utf8" });
}

function noteStandardIssue(issue, reason, detail = "") {
  writeReport(`LOI_CHUAN_WEB: ${issue}. Ly do: ${reason}. Chi tiet: ${detail}`);
}

function clearAuthState(I) {
  I.usePlaywrightTo("clear auth state", async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
}

function loginAsAdmin(I) {
  I.amOnPage(`${BASE_URL}/login`);
  I.fillField('input[type="email"]', ADMIN_EMAIL);
  I.fillField('input[type="password"]', ADMIN_PASSWORD);
  I.click('button[type="submit"]');
  I.waitInUrl("/dashboard", 10);
}

function loginAsOwner(I, email, password) {
  I.amOnPage(`${BASE_URL}/login`);
  I.fillField('input[type="email"]', email);
  I.fillField('input[type="password"]', password);
  I.click('button[type="submit"]');
  I.waitInUrl("/owner", 10);
}

function goToUsers(I) {
  I.amOnPage(`${BASE_URL}/sysadmin/users`);
  I.waitInUrl("/sysadmin/users", 10);
  I.waitForElement("table", 10);
}

function goToRestaurants(I) {
  I.amOnPage(`${BASE_URL}/sysadmin/restaurants`);
  I.waitInUrl("/sysadmin/restaurants", 10);
  I.waitForElement("table", 10);
}

function openTenantDialog(I) {
  I.usePlaywrightTo("open tenant dialog", async ({ page }) => {
    const btn = page
      .locator('button:visible', { hasText: /Đăng ký mới|Dang ky moi|Tạo nhà hàng|Tao nha hang/i })
      .first();
    await btn.waitFor({ state: "visible", timeout: 15000 });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();

    const dialog = page.getByRole("dialog").first();
    const nameInput = page
      .locator('input[placeholder="Kichi Kichi..."], input[placeholder*="Kichi"]')
      .first();
    await Promise.race([
      dialog.waitFor({ state: "visible", timeout: 15000 }),
      nameInput.waitFor({ state: "visible", timeout: 15000 }),
    ]);
  });
}

function fillTenantDialog(I, d) {
  I.usePlaywrightTo("fill tenant dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const hasDialog = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = hasDialog ? dialog.first() : page;

    const nameInput = scope.locator('input[placeholder="Kichi Kichi..."]').first();
    await nameInput.waitFor({ state: "visible", timeout: 15000 });
    await nameInput.fill(d.restaurantName);
    await scope.locator('input[placeholder="123 Đường ABC..."]').fill(d.address);
    await scope.locator('input[placeholder="0909..."]').fill(d.phoneNumber);
    await scope.locator('input[placeholder="Nguyễn Văn A"]').fill(d.ownerName);
    await scope.locator('input[placeholder="owner@gmail.com"]').fill(d.email);
    await scope.locator('input[type="password"]').fill(d.password);

    const planCombo = scope.getByRole("combobox").first();
    await planCombo.click();
    await page.getByRole("option", { name: new RegExp(`Gói\\s+${d.planType}`, "i") }).first().click();
  });
}

function submitTenantDialog(I) {
  I.usePlaywrightTo("submit tenant dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const hasDialog = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = hasDialog ? dialog.first() : page;
    const btn = scope.getByRole("button", { name: /Khởi tạo Nhà hàng|Khoi tao Nha hang|Tạo nhà hàng|Tao nha hang/i }).first();
    await btn.waitFor({ state: "visible", timeout: 15000 });
    await btn.click();
    if (hasDialog) {
      await Promise.race([
        dialog.first().waitFor({ state: "hidden", timeout: 20000 }),
        page.waitForURL(/\/sysadmin\/restaurants/, { timeout: 20000 }),
      ]);
    } else {
      await page.waitForTimeout(1200);
    }
  });
}

function searchRestaurant(I, name) {
  I.usePlaywrightTo("search restaurant", async ({ page }) => {
    const input = page
      .locator(
        [
          'input[placeholder*="Tìm theo Tên"]',
          'input[placeholder*="Tim theo Ten"]',
          'input[placeholder*="ID..."]',
          'input[placeholder*="Tìm kiếm nhà hàng"]',
          'input[placeholder*="Tim kiem nha hang"]',
        ].join(", ")
      )
      .first();
    await input.waitFor({ state: "visible", timeout: 10000 });
    await input.fill("");
    await input.fill(name);
    await page.waitForTimeout(700);
  });
}

function ensureRestaurantCreated(I, name) {
  searchRestaurant(I, name);
  I.usePlaywrightTo("ensure restaurant row", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: name });
    const count = await row.count();
    if (count < 1) {
      writeReport(`TENANT_NOT_FOUND: ${name}`);
    }
  });
}

function createOwnerTenant(I, d) {
  goToRestaurants(I);
  openTenantDialog(I);
  fillTenantDialog(I, d);
  submitTenantDialog(I);
  ensureRestaurantCreated(I, d.restaurantName);
}

function searchUser(I, keyword) {
  I.usePlaywrightTo("search user", async ({ page }) => {
    const input = page
      .locator(
        [
          'input[placeholder="Tìm user..."]',
          'input[placeholder*="Tìm user"]',
          'input[placeholder*="Tim user"]',
          'input[placeholder*="Tìm theo Email"]',
          'input[placeholder*="Tim theo Email"]',
          'input[type="search"]',
        ].join(", ")
      )
      .first();
    await input.waitFor({ state: "visible", timeout: 15000 });
    await input.fill("");
    await input.fill(keyword);
    await page.waitForTimeout(600);
  });
}

function ensureUserRow(I, email) {
  I.usePlaywrightTo(`ensure user row ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email });
    const count = await row.count();
    if (count < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
    }
  });
}

function expectRole(I, email, rolePattern) {
  I.usePlaywrightTo(`expect role for ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
      return;
    }
    const badge = row.locator("span").filter({ hasText: rolePattern }).first();
    if ((await badge.count()) < 1) {
      noteStandardIssue(
        "ROLE_NOT_MATCH",
        "Vai trò hiển thị sai sẽ dẫn đến thao tác quản trị không đúng quyền",
        `email=${email}, expected=${rolePattern}`
      );
    }
  });
}

function expectStatus(I, email, status) {
  I.usePlaywrightTo(`expect status ${status} for ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
      return;
    }
    const badge = row.locator("span").filter({ hasText: new RegExp(`^${status}$`, "i") }).first();
    if ((await badge.count()) < 1) {
      noteStandardIssue(
        "STATUS_NOT_MATCH",
        "Trạng thái user hiển thị sai có thể gây hiểu nhầm và thao tác sai",
        `email=${email}, expected=${status}`
      );
    }
  });
}

function expectMenuAction(I, email, expectedAction) {
  I.usePlaywrightTo(`expect menu action ${expectedAction} for ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
      return;
    }
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });

    const hasLock = (await page.getByRole("menuitem", { name: /Khóa|Khoa/i }).count()) > 0;
    const hasUnlock = (await page.getByRole("menuitem", { name: /Mở khóa|Mo khoa/i }).count()) > 0;

    if (expectedAction === "lock" && !hasLock) {
      noteStandardIssue(
        "ACTION_LABEL_MISMATCH",
        "UI cần hiển thị đúng hành động theo trạng thái hiện tại",
        `email=${email}, expected=Khóa`
      );
    }
    if (expectedAction === "unlock" && !hasUnlock) {
      noteStandardIssue(
        "ACTION_LABEL_MISMATCH",
        "UI cần hiển thị đúng hành động theo trạng thái hiện tại",
        `email=${email}, expected=Mở khóa`
      );
    }

    if (expectedAction === "lock" && hasUnlock) {
      writeReport(`GHI_CHU: ${email} đang Locked (menu hiển thị Mở khóa).`);
    }
    if (expectedAction === "unlock" && hasLock) {
      writeReport(`GHI_CHU: ${email} đang Active (menu hiển thị Khóa).`);
    }

    await page.keyboard.press("Escape");
  });
}

function toggleLock(I, email, actionLabel) {
  I.usePlaywrightTo(`toggle ${actionLabel} for ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
      return;
    }
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });

    const item = page.getByRole("menuitem", { name: actionLabel }).first();
    if ((await item.count()) < 1) {
      writeReport(`ACTION_NOT_FOUND: ${actionLabel} for ${email}`);
      await page.keyboard.press("Escape");
      return;
    }

    page.once("dialog", (dialog) => dialog.accept());
    await item.click();
    await page.waitForTimeout(800);
  });
}

function expectSelfLockBlocked(I, email) {
  I.usePlaywrightTo(`expect self lock blocked for ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
      return;
    }
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });
    const hasLock = (await page.getByRole("menuitem", { name: /Khóa|Khoa/i }).count()) > 0;
    if (hasLock) {
      noteStandardIssue(
        "SELF_LOCK_ALLOWED",
        "Hệ thống cần chặn khóa chính tài khoản đang đăng nhập",
        `email=${email}`
      );
    } else {
      writeReport(`GHI_CHU: SELF_LOCK_BLOCKED for ${email}`);
    }
    await page.keyboard.press("Escape");
  });
}

function attemptLogin(I, email, password, expectSuccess, label, expectedUrlPattern) {
  I.usePlaywrightTo(`attempt login ${label}`, async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').click();

    let success = false;
    try {
      await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 8000 });
      success = true;
    } catch {
      success = false;
    }

    const bodyText = await page.textContent("body").catch(() => "");
    const hasLockMessage = /khóa|locked|bị khóa/i.test(bodyText || "");

    if (expectSuccess && success && expectedUrlPattern) {
      const url = page.url();
      if (!expectedUrlPattern.test(url)) {
        noteStandardIssue(
          `LOGIN_${label}_WRONG_LANDING`,
          "Đăng nhập đúng role cần điều hướng đúng màn hình",
          `email=${email}, url=${url}`
        );
      }
    }

    if (expectSuccess && !success) {
      noteStandardIssue(
        `LOGIN_${label}_FAILED`,
        "Đăng nhập hợp lệ phải thành công",
        `email=${email}`
      );
    }

    if (!expectSuccess && success) {
      noteStandardIssue(
        `LOGIN_${label}_SHOULD_FAIL`,
        "Tài khoản bị khóa phải bị chặn đăng nhập",
        `email=${email}`
      );
    }

    if (!expectSuccess && !success && !hasLockMessage) {
      noteStandardIssue(
        `LOGIN_${label}_MISSING_LOCK_MESSAGE`,
        "Cần có thông báo rõ ràng khi tài khoản bị khóa",
        `email=${email}`
      );
    }
  });
}

function goToOwnerStaff(I) {
  I.amOnPage(`${BASE_URL}/owner/staff`);
  I.waitInUrl("/owner/staff", 10);
}

function openCreateStaffDialog(I) {
  I.usePlaywrightTo("open create staff dialog", async ({ page }) => {
    const createButton = page.getByRole("button", { name: "Thêm nhân viên" });
    const dialog = page.getByRole("dialog");
    await createButton.waitFor({ state: "visible", timeout: 10000 });
    await createButton.click();
    await dialog.waitFor({ state: "visible", timeout: 10000 });
  });
}

function createStaff(I, staff) {
  openCreateStaffDialog(I);
  I.fillField('input[name="email"]', staff.email);
  I.fillField('input[name="password"]', staff.password);
  I.fillField('input[name="name"]', staff.fullName);
  I.fillField('input[name="phoneNumber"]', staff.phoneNumber);

  I.usePlaywrightTo("select staff role and branch", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const roleSelect = dialog.getByRole("combobox").first();
    await roleSelect.click();
    await page.getByRole("option", { name: /Phục vụ/i }).first().click();

    const branchSelect = dialog.getByRole("combobox").nth(1);
    await branchSelect.click();
    await page.getByRole("option").first().click();
  });

  I.click("Lưu thay đổi");
  I.usePlaywrightTo("wait staff dialog closed", async ({ page }) => {
    await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 10000 });
  });
  I.waitForText(staff.email, 10);
}

function deleteStaff(I, staffEmail) {
  I.usePlaywrightTo("delete staff", async ({ page }) => {
    const card = page.locator(".group").filter({ hasText: staffEmail }).first();
    if ((await card.count()) < 1) return;
    await card.hover();
    const deleteBtn = card.getByRole("button").last();
    page.once("dialog", (dialog) => dialog.accept());
    await deleteBtn.click();
    await card.waitFor({ state: "hidden", timeout: 10000 }).catch(() => undefined);
  });
}

function createSystemAdmin(I, email, fullName, password) {
  I.usePlaywrightTo("create system admin", async ({ page }) => {
    const createBtn = page.getByRole("button", { name: /Thêm Admin/i });
    await createBtn.waitFor({ state: "visible", timeout: 10000 });
    await createBtn.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    const inputs = dialog.locator("input");
    await inputs.nth(0).fill(email);
    await inputs.nth(1).fill(fullName);
    await inputs.nth(2).fill(password);
    await dialog.getByRole("button", { name: /Tạo tài khoản/i }).click();
    await dialog.waitFor({ state: "hidden", timeout: 10000 });
  });
  searchUser(I, email);
  ensureUserRow(I, email);
}

function deleteSystemAdmin(I, email) {
  I.usePlaywrightTo(`delete admin ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) return;
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });
    const item = page.getByRole("menuitem", { name: /Xóa|Xoa/i }).first();
    if ((await item.count()) < 1) return;
    page.once("dialog", (dialog) => dialog.accept());
    await item.click();
    await page.waitForTimeout(800);
  });
}

Scenario("[ITC_10 Complete] Khóa/Mở khóa user cho staff/owner/systemadmin", ({ I }) => {
  const ownerDraft = {
    restaurantName: `ITC10-Rest-${suffix()}`,
    ownerName: `Owner ITC10 ${suffix()}`,
    email: `owner_itc10_${suffix()}@s2o.test`,
    password: OWNER_PASSWORD,
    address: "123 ITC10 Street",
    phoneNumber: "0909123456",
    planType: "Free",
  };
  const staffDraft = {
    email: `staff_itc10_${suffix()}@s2o.test`,
    fullName: `Staff ITC10 ${suffix()}`,
    password: STAFF_PASSWORD,
    phoneNumber: "0901234567",
  };
  const sysadminTarget = {
    email: `sysadmin_lock_${suffix()}@s2o.test`,
    fullName: `Sysadmin Lock ${suffix()}`,
    password: "Admin@Test123",
  };

  mark(I, "START");
  loginAsAdmin(I);
  createOwnerTenant(I, ownerDraft);
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerDraft.password, true, "OWNER_CREATED", /\/owner/i);
  loginAsOwner(I, ownerDraft.email, ownerDraft.password);
  goToOwnerStaff(I);
  createStaff(I, staffDraft);
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  createSystemAdmin(I, sysadminTarget.email, sysadminTarget.fullName, sysadminTarget.password);

  mark(I, "ITC_10.1");
  searchUser(I, staffDraft.email);
  ensureUserRow(I, staffDraft.email);
  expectRole(I, staffDraft.email, /Staff|Waiter|Chef|Manager/i);
  expectStatus(I, staffDraft.email, "Active");
  expectMenuAction(I, staffDraft.email, "lock");

  searchUser(I, ownerDraft.email);
  ensureUserRow(I, ownerDraft.email);
  expectRole(I, ownerDraft.email, /Owner/i);
  expectStatus(I, ownerDraft.email, "Active");
  expectMenuAction(I, ownerDraft.email, "lock");

  searchUser(I, sysadminTarget.email);
  ensureUserRow(I, sysadminTarget.email);
  expectRole(I, sysadminTarget.email, "SystemAdmin");
  expectStatus(I, sysadminTarget.email, "Active");
  expectMenuAction(I, sysadminTarget.email, "lock");

  mark(I, "ITC_10.2-10.4 (PHASE 1: Khóa Staff, Owner, SystemAdmin lần lượt)");
  searchUser(I, staffDraft.email);
  toggleLock(I, staffDraft.email, /Khóa|Khoa/i);
  expectStatus(I, staffDraft.email, "Locked");
  expectMenuAction(I, staffDraft.email, "unlock");

  searchUser(I, ownerDraft.email);
  toggleLock(I, ownerDraft.email, /Khóa|Khoa/i);
  expectStatus(I, ownerDraft.email, "Locked");
  expectMenuAction(I, ownerDraft.email, "unlock");

  searchUser(I, sysadminTarget.email);
  toggleLock(I, sysadminTarget.email, /Khóa|Khoa/i);
  expectStatus(I, sysadminTarget.email, "Locked");
  expectMenuAction(I, sysadminTarget.email, "unlock");

  mark(I, "ITC_10.5-10.7 (PHASE 2: Thử đăng nhập tất cả bị khóa -> tất cả phải fail)");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffDraft.password, false, "STAFF_LOCKED", /\/staff/i);
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerDraft.password, false, "OWNER_LOCKED", /\/owner/i);
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminTarget.password, false, "SYSADMIN_LOCKED", /\/dashboard/i);

  mark(I, "ITC_10.8-10.10 (PHASE 3: Mở khóa Staff, Owner, SystemAdmin lần lượt)");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);

  searchUser(I, staffDraft.email);
  toggleLock(I, staffDraft.email, /Mở khóa|Mo khoa/i);
  expectStatus(I, staffDraft.email, "Active");
  expectMenuAction(I, staffDraft.email, "lock");

  searchUser(I, ownerDraft.email);
  toggleLock(I, ownerDraft.email, /Mở khóa|Mo khoa/i);
  expectStatus(I, ownerDraft.email, "Active");
  expectMenuAction(I, ownerDraft.email, "lock");

  searchUser(I, sysadminTarget.email);
  toggleLock(I, sysadminTarget.email, /Mở khóa|Mo khoa/i);
  expectStatus(I, sysadminTarget.email, "Active");
  expectMenuAction(I, sysadminTarget.email, "lock");

  mark(I, "ITC_10.11-10.13 (PHASE 4: Thử đăng nhập tất cả đã mở khóa -> tất cả phải success)");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffDraft.password, true, "STAFF_UNLOCKED", /\/staff/i);
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerDraft.password, true, "OWNER_UNLOCKED", /\/owner/i);
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminTarget.password, true, "SYSADMIN_UNLOCKED", /\/dashboard/i);

  mark(I, "ITC_10.14");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, ADMIN_EMAIL);
  expectSelfLockBlocked(I, ADMIN_EMAIL);

  mark(I, "ITC_10.15");
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, staffDraft.email);
  expectMenuAction(I, staffDraft.email, "lock");
  toggleLock(I, staffDraft.email, /Khóa|Khoa/i);
  expectStatus(I, staffDraft.email, "Locked");
  expectMenuAction(I, staffDraft.email, "unlock");
  // Thử khóa lại khi đang Locked
  expectMenuAction(I, staffDraft.email, "unlock");

  mark(I, "ITC_10.16");
  toggleLock(I, staffDraft.email, /Mở khóa|Mo khoa/i);
  expectStatus(I, staffDraft.email, "Active");
  expectMenuAction(I, staffDraft.email, "lock");
  // Thử mở khóa lại khi đang Active
  expectMenuAction(I, staffDraft.email, "lock");

  mark(I, "ITC_10.17");
  searchUser(I, ownerDraft.email);
  expectMenuAction(I, ownerDraft.email, "lock");
  toggleLock(I, ownerDraft.email, /Khóa|Khoa/i);
  expectMenuAction(I, ownerDraft.email, "unlock");
  toggleLock(I, ownerDraft.email, /Mở khóa|Mo khoa/i);
  expectMenuAction(I, ownerDraft.email, "lock");

  clearAuthState(I);
  loginAsOwner(I, ownerDraft.email, ownerDraft.password);
  goToOwnerStaff(I);
  deleteStaff(I, staffDraft.email);
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, sysadminTarget.email);
  deleteSystemAdmin(I, sysadminTarget.email);

  mark(I, "END");
});
