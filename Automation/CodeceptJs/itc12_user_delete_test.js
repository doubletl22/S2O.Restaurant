Feature("ITC_12 - Xóa người dùng");

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@s2o.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "Staff@123";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@123";

const REPORT_PATH = path.join(__dirname, "itc12_report.txt");

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

function verifyDeleteMenu(I, email) {
  I.usePlaywrightTo(`verify delete menu exists for ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
      return;
    }
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });

    const deleteItem = page.getByRole("menuitem", { name: /Xóa|Xoa/i }).first();
    if ((await deleteItem.count()) < 1) {
      noteStandardIssue(
        "DELETE_MENU_NOT_FOUND",
        "Cần có option xóa trong menu hành động",
        `email=${email}`
      );
    }

    await page.keyboard.press("Escape");
  });
}

function deleteUser(I, email, confirmDelete = true) {
  I.usePlaywrightTo(`delete user ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND_FOR_DELETE: ${email}`);
      return;
    }
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });

    const deleteItem = page.getByRole("menuitem", { name: /Xóa|Xoa/i }).first();
    if ((await deleteItem.count()) < 1) {
      writeReport(`DELETE_ACTION_NOT_FOUND: ${email}`);
      await page.keyboard.press("Escape");
      return;
    }

    if (confirmDelete) {
      page.once("dialog", (dialog) => dialog.accept());
    } else {
      page.once("dialog", (dialog) => dialog.dismiss());
    }
    await deleteItem.click();
    await page.waitForTimeout(800);
  });
}

function verifyUserDeleted(I, email) {
  I.usePlaywrightTo(`verify user deleted ${email}`, async ({ page }) => {
    await page.waitForTimeout(500);
    const row = page.locator("tbody tr").filter({ hasText: email });
    const count = await row.count();
    if (count > 0) {
      noteStandardIssue(
        "USER_NOT_DELETED",
        "User phải biến mất khỏi danh sách sau khi xóa",
        `email=${email}`
      );
    } else {
      writeReport(`GHI_CHU: User ${email} đã biến mất khỏi danh sách.`);
    }
  });
}

function verifyUserStillExists(I, email) {
  I.usePlaywrightTo(`verify user still exists ${email}`, async ({ page }) => {
    searchUser(I, email);
    const row = page.locator("tbody tr").filter({ hasText: email });
    const count = await row.count();
    if (count < 1) {
      noteStandardIssue(
        "USER_DELETED_AFTER_CANCEL",
        "User không nên bị xóa khi click Cancel ở hộp thoại xác nhận",
        `email=${email}`
      );
    } else {
      writeReport(`GHI_CHU: User ${email} vẫn còn sau khi click Cancel.`);
    }
  });
}

function attemptLogin(I, email, password, expectSuccess, label) {
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
        "User đã xóa phải bị chặn đăng nhập",
        `email=${email}`
      );
    }
  });
}

function expectSelfDeleteBlocked(I, email) {
  I.usePlaywrightTo(`expect self delete blocked for ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
      return;
    }
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });
    const hasDelete = (await page.getByRole("menuitem", { name: /Xóa|Xoa/i }).count()) > 0;
    if (hasDelete) {
      noteStandardIssue(
        "SELF_DELETE_ALLOWED",
        "Hệ thống cần chặn xóa chính tài khoản đang đăng nhập",
        `email=${email}`
      );
    } else {
      writeReport(`GHI_CHU: SELF_DELETE_BLOCKED for ${email}`);
    }
    await page.keyboard.press("Escape");
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

Scenario("[ITC_12 Complete] Xóa người dùng cho staff/owner/systemadmin", ({ I }) => {
  const ownerDraft = {
    restaurantName: `ITC12-Rest-${suffix()}`,
    ownerName: `Owner ITC12 ${suffix()}`,
    email: `owner_itc12_${suffix()}@s2o.test`,
    password: OWNER_PASSWORD,
    address: "123 ITC12 Street",
    phoneNumber: "0909123456",
    planType: "Free",
  };
  const staffDraft = {
    email: `staff_itc12_${suffix()}@s2o.test`,
    fullName: `Staff ITC12 ${suffix()}`,
    password: STAFF_PASSWORD,
    phoneNumber: "0901234567",
  };
  const staffDraftLocked = {
    email: `staff_itc12_locked_${suffix()}@s2o.test`,
    fullName: `Staff ITC12 Locked ${suffix()}`,
    password: STAFF_PASSWORD,
    phoneNumber: "0901234567",
  };
  const sysadminTarget = {
    email: `sysadmin_delete_${suffix()}@s2o.test`,
    fullName: `Sysadmin Delete ${suffix()}`,
    password: "Admin@Test123",
  };

  mark(I, "START");
  if (fs.existsSync(REPORT_PATH)) {
    fs.unlinkSync(REPORT_PATH);
  }
  loginAsAdmin(I);
  createOwnerTenant(I, ownerDraft);
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerDraft.password, true, "OWNER_CREATED");
  loginAsOwner(I, ownerDraft.email, ownerDraft.password);
  goToOwnerStaff(I);
  createStaff(I, staffDraft);
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  createSystemAdmin(I, sysadminTarget.email, sysadminTarget.fullName, sysadminTarget.password);

  mark(I, "ITC_12.1");
  searchUser(I, staffDraft.email);
  ensureUserRow(I, staffDraft.email);
  expectRole(I, staffDraft.email, /Staff|Waiter|Chef|Manager/i);
  expectStatus(I, staffDraft.email, "Active");
  verifyDeleteMenu(I, staffDraft.email);

  searchUser(I, ownerDraft.email);
  ensureUserRow(I, ownerDraft.email);
  expectRole(I, ownerDraft.email, /Owner/i);
  expectStatus(I, ownerDraft.email, "Active");
  verifyDeleteMenu(I, ownerDraft.email);

  searchUser(I, sysadminTarget.email);
  ensureUserRow(I, sysadminTarget.email);
  expectRole(I, sysadminTarget.email, "SystemAdmin");
  expectStatus(I, sysadminTarget.email, "Active");
  verifyDeleteMenu(I, sysadminTarget.email);

  mark(I, "ITC_12.2-12.3 (Bấm Xóa -> hộp thoại xuất hiện -> click Cancel)");
  searchUser(I, staffDraft.email);
  deleteUser(I, staffDraft.email, false);
  verifyUserStillExists(I, staffDraft.email);

  mark(I, "ITC_12.4-12.5 (Xóa staff -> login fail)");
  searchUser(I, staffDraft.email);
  deleteUser(I, staffDraft.email, true);
  verifyUserDeleted(I, staffDraft.email);
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffDraft.password, false, "STAFF_DELETED");

  mark(I, "ITC_12.13 (Tạo staff, khóa, rồi xóa)");
  clearAuthState(I);
  loginAsOwner(I, ownerDraft.email, ownerDraft.password);
  goToOwnerStaff(I);
  createStaff(I, staffDraftLocked);
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, staffDraftLocked.email);
  I.usePlaywrightTo("lock staff before delete", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: staffDraftLocked.email }).first();
    if ((await row.count()) < 1) return;
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });
    const lockItem = page.getByRole("menuitem", { name: /Khóa|Khoa/i }).first();
    if ((await lockItem.count()) > 0) {
      page.once("dialog", (dialog) => dialog.accept());
      await lockItem.click();
      await page.waitForTimeout(800);
    }
    await page.keyboard.press("Escape");
  });

  searchUser(I, staffDraftLocked.email);
  deleteUser(I, staffDraftLocked.email, true);
  verifyUserDeleted(I, staffDraftLocked.email);
  writeReport(`GHI_CHU: User locked ${staffDraftLocked.email} đã được xóa thành công.`);

  mark(I, "ITC_12.6-12.7 (Xóa owner -> login fail)");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, ownerDraft.email);
  deleteUser(I, ownerDraft.email, true);
  verifyUserDeleted(I, ownerDraft.email);
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerDraft.password, false, "OWNER_DELETED");

  mark(I, "ITC_12.8-12.9 (Xóa systemadmin -> login fail)");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, sysadminTarget.email);
  deleteUser(I, sysadminTarget.email, true);
  verifyUserDeleted(I, sysadminTarget.email);
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminTarget.password, false, "SYSADMIN_DELETED");

  mark(I, "ITC_12.10 (Thử xóa tài khoản đang login)");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, ADMIN_EMAIL);
  expectSelfDeleteBlocked(I, ADMIN_EMAIL);

  mark(I, "ITC_12.11 (Search user đã xóa -> không tìm thấy)");
  searchUser(I, staffDraft.email);
  I.usePlaywrightTo("verify search no result", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: staffDraft.email });
    const count = await row.count();
    if (count > 0) {
      noteStandardIssue(
        "DELETED_USER_FOUND_IN_SEARCH",
        "User đã xóa không nên xuất hiện trong tìm kiếm",
        `email=${staffDraft.email}`
      );
    } else {
      writeReport(`GHI_CHU: User ${staffDraft.email} không tìm thấy sau xóa.`);
    }
  });

  mark(I, "ITC_12.12 (Refresh page -> user không xuất hiện lại)");
  I.amOnPage(`${BASE_URL}/sysadmin/users`);
  I.waitForElement("table", 10);
  searchUser(I, staffDraft.email);
  I.usePlaywrightTo("verify no result after refresh", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: staffDraft.email });
    const count = await row.count();
    if (count > 0) {
      noteStandardIssue(
        "DELETED_USER_REAPPEARED",
        "User đã xóa không nên xuất hiện lại sau refresh",
        `email=${staffDraft.email}`
      );
    } else {
      writeReport(`GHI_CHU: Sau refresh, user ${staffDraft.email} vẫn không xuất hiện.`);
    }
  });

  mark(I, "ITC_12.14 (Xóa user lần 2 -> báo lỗi)");
  I.usePlaywrightTo("try delete already deleted user", async ({ page }) => {
    searchUser(I, staffDraftLocked.email);
    const row = page.locator("tbody tr").filter({ hasText: staffDraftLocked.email });
    const count = await row.count();
    if (count > 0) {
      noteStandardIssue(
        "ALREADY_DELETED_USER_FOUND",
        "User đã xóa không nên xuất hiện trong danh sách khi thực hiện lần 2",
        `email=${staffDraftLocked.email}`
      );
    } else {
      writeReport(`GHI_CHU: Xóa lần 2 - user ${staffDraftLocked.email} không tìm thấy (hợp lệ).`);
    }
  });

  mark(I, "END - Cleanup (xóa owner trong DB để test độc lập)");
});
