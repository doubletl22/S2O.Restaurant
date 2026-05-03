Feature("ITC_COMPREHENSIVE - Tổng hợp ITC_5, ITC_10, ITC_12, ITC_13, ITC_15, ITC_49");

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@s2o.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "Staff@123";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@123";

const REPORT_PATH = path.join(__dirname, "itc_comprehensive_report.txt");

const USER_SEARCH_SELECTOR = [
  'input[placeholder="Tìm user..."]',
  'input[placeholder*="Tìm user"]',
  'input[placeholder*="Tim user"]',
  'input[placeholder*="Tìm theo Email"]',
  'input[placeholder*="Tim theo Email"]',
  'input[type="search"]',
].join(", ");

const REST_SEARCH_SELECTOR = [
  'input[placeholder*="Tìm theo Tên"]',
  'input[placeholder*="Tim theo Ten"]',
  'input[placeholder*="ID..."]',
  'input[placeholder*="Tìm kiếm nhà hàng"]',
  'input[placeholder*="Tim kiem nha hang"]',
].join(", ");

function suffix() {
  return Math.random().toString(36).slice(2, 10);
}

function passwordOfLength(len) {
  const base = "Abc@";
  if (len <= base.length) return base.slice(0, len);
  return `${base}${"9".repeat(len - base.length)}`;
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

function goToOwnerStaff(I) {
  I.amOnPage(`${BASE_URL}/owner/staff`);
  I.waitInUrl("/owner/staff", 10);
}

function openTenantDialog(I) {
  I.usePlaywrightTo("open tenant dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const nameSelector =
      'input[placeholder="Kichi Kichi..."], input[placeholder*="Kichi"], input[placeholder*="Tên thương hiệu"], input[placeholder*="Ten thuong hieu"], input[placeholder*="Tên nhà hàng"], input[placeholder*="Ten nha hang"]';
    const nameInput = page.locator(nameSelector).first();
    const anyDialogInput = dialog.locator("input").first();

    const dialogVisible =
      (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));

    if (!dialogVisible) {
      const btn = page
        .getByRole("button", { name: /Đăng ký mới|Dang ky moi|Tạo nhà hàng|Tao nha hang/i })
        .first();
      await btn.waitFor({ state: "visible", timeout: 15000 });
      await btn.scrollIntoViewIfNeeded();
      try {
        await btn.click({ timeout: 15000 });
      } catch {
        await page.waitForTimeout(400);
        await btn.click({ timeout: 15000, force: true });
      }
    }

    try {
      await Promise.race([
        dialog.waitFor({ state: "visible", timeout: 15000 }),
        nameInput.waitFor({ state: "visible", timeout: 15000 }),
        anyDialogInput.waitFor({ state: "visible", timeout: 15000 }),
      ]);
    } catch {
      const btn = page
        .getByRole("button", { name: /Đăng ký mới|Dang ky moi|Tạo nhà hàng|Tao nha hang/i })
        .first();
      await btn.click({ timeout: 15000, force: true });
      await Promise.race([
        dialog.waitFor({ state: "visible", timeout: 15000 }),
        nameInput.waitFor({ state: "visible", timeout: 15000 }),
        anyDialogInput.waitFor({ state: "visible", timeout: 15000 }),
      ]);
    }
  });
}

function fillTenantDialog(I, d) {
  I.usePlaywrightTo("fill tenant dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const hasDialog = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = hasDialog ? dialog.first() : page;

    const nameSelector =
      'input[placeholder="Kichi Kichi..."], input[placeholder*="Kichi"], input[placeholder*="Tên thương hiệu"], input[placeholder*="Ten thuong hieu"], input[placeholder*="Tên nhà hàng"], input[placeholder*="Ten nha hang"]';
    const nameInput = scope.locator(nameSelector).first();
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

function closeTenantDialog(I, mode = "cancel") {
  I.usePlaywrightTo("close tenant dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));
    if (!visible) return;

    if (mode === "escape") {
      await page.keyboard.press("Escape");
    } else {
      const cancelBtn = dialog.getByRole("button", { name: /Hủy|Huy/i });
      if ((await cancelBtn.count()) > 0) await cancelBtn.first().click();
      else await page.keyboard.press("Escape");
    }

    await dialog.waitFor({ state: "hidden", timeout: 10000 });
  });
}

function searchRestaurant(I, keyword) {
  I.usePlaywrightTo("search restaurant", async ({ page }) => {
    const input = page.locator(REST_SEARCH_SELECTOR).first();
    await input.waitFor({ state: "visible", timeout: 10000 });
    await input.fill("");
    await input.fill(keyword);
    await page.waitForTimeout(700);
  });
}

function clearRestaurantSearch(I) {
  I.usePlaywrightTo("clear restaurant search", async ({ page }) => {
    const input = page.locator(REST_SEARCH_SELECTOR).first();
    await input.waitFor({ state: "visible", timeout: 10000 });
    await input.fill("");
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

function verifyRestaurantCreated(I, name) {
  goToRestaurants(I);
  searchRestaurant(I, name);
  I.usePlaywrightTo("verify restaurant created", async ({ page }) => {
    const rows = page.locator("tbody tr").filter({ hasText: name });
    const count = await rows.count();
    if (count < 1) {
      noteStandardIssue("TENANT_NOT_CREATED", "Nhà hàng được đăng ký phải xuất hiện trong danh sách", name);
    }
  });
}

function assertDialogError(I, expectedText, label) {
  I.usePlaywrightTo(`expect dialog error ${label}`, async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));
    if (!visible) {
      noteStandardIssue(
        `${label}_DIALOG_NOT_OPEN`,
        "Form validation phải giữ dialog mở để người dùng sửa",
        expectedText
      );
      return;
    }
    const text = await dialog.innerText().catch(() => "");
    if (!text.includes(expectedText)) {
      noteStandardIssue(
        `${label}_ERROR_MISSING`,
        "Cần hiển thị thông báo lỗi rõ ràng cho dữ liệu không hợp lệ",
        `expected="${expectedText}", actual="${text.slice(0, 160)}"`
      );
    }
  });
}

function verifyNotCreated(I, name) {
  if (!name || !name.trim()) {
    writeReport(`SKIP_VERIFY: name is empty, skipping for safety`);
    return;
  }
  searchRestaurant(I, name);
  I.usePlaywrightTo("verify not created", async ({ page }) => {
    const rows = page.locator("tbody tr").filter({ hasText: name });
    const count = await rows.count();
    if (count > 0) {
      noteStandardIssue(
        "INVALID_DATA_CREATED",
        "Dữ liệu không hợp lệ không nên được tạo",
        `name="${name}", rows=${count}`
      );
    }
  });
}

function searchUser(I, keyword) {
  I.usePlaywrightTo("search user", async ({ page }) => {
    const input = page.locator(USER_SEARCH_SELECTOR).first();
    await input.waitFor({ state: "visible", timeout: 15000 });
    await input.fill("");
    await input.fill(keyword);
    await page.waitForTimeout(600);
  });
}

function clearUserSearch(I) {
  I.usePlaywrightTo("clear user search", async ({ page }) => {
    const input = page.locator(USER_SEARCH_SELECTOR).first();
    await input.waitFor({ state: "visible", timeout: 15000 });
    await input.fill("");
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
        "Trạng thái user hiển thị sai có thể gây hiểu nhầm",
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
        "UI cần hiển thị đúng hành động theo trạng thái",
        `email=${email}, expected=Khóa`
      );
    }
    if (expectedAction === "unlock" && !hasUnlock) {
      noteStandardIssue(
        "ACTION_LABEL_MISMATCH",
        "UI cần hiển thị đúng hành động theo trạng thái",
        `email=${email}, expected=Mở khóa`
      );
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
    try {
      await item.click({ timeout: 10000 });
    } catch {
      await page.waitForTimeout(400);
      await item.click({ timeout: 10000, force: true });
    }
    await page.waitForTimeout(800);
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
        "Đăng nhập không hợp lệ phải bị chặn",
        `email=${email}`
      );
    }
  });
}

function openCreateStaffDialog(I) {
  I.usePlaywrightTo("open create staff dialog", async ({ page }) => {
    const createButton = page.getByRole("button", { name: "Thêm nhân viên" });
    const dialog = page.getByRole("dialog");
    const emailInput = page.locator('input[name="email"]').first();
    const nameInput = page.locator('input[name="name"]').first();

    await createButton.waitFor({ state: "visible", timeout: 15000 });
    try {
      await createButton.click({ timeout: 10000 });
    } catch {
      await page.waitForTimeout(400);
      await createButton.click({ timeout: 10000, force: true });
    }

    await Promise.race([
      dialog.waitFor({ state: "visible", timeout: 15000 }),
      emailInput.waitFor({ state: "visible", timeout: 15000 }),
      nameInput.waitFor({ state: "visible", timeout: 15000 }),
    ]);
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
}

function openChangePasswordDialog(I, email) {
  searchUser(I, email);
  I.usePlaywrightTo(`open change password dialog ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    if ((await row.count()) < 1) {
      writeReport(`USER_NOT_FOUND: ${email}`);
      return;
    }
    const trigger = row.locator("td").last().getByRole("button").first();
    await trigger.click();
    await page.getByRole("menuitem").first().waitFor({ state: "visible", timeout: 5000 });

    const changeItem = page
      .getByRole("menuitem", { name: /Đổi mật khẩu|Doi mat khau|Change password/i })
      .first();
    if ((await changeItem.count()) < 1) {
      noteStandardIssue(
        "CHANGE_PASSWORD_MENU_NOT_FOUND",
        "Cần có mục Đổi mật khẩu trong menu hành động",
        `email=${email}`
      );
      await page.keyboard.press("Escape");
      return;
    }

    await changeItem.click();
    const dialog = page.getByRole("dialog").first();
    const passInput = page.locator('input[type="text"], input[type="password"]').first();
    await Promise.race([
      dialog.waitFor({ state: "visible", timeout: 10000 }),
      passInput.waitFor({ state: "visible", timeout: 10000 }),
    ]);
  });
}

function expectChangePasswordTarget(I, email) {
  I.usePlaywrightTo(`expect change password target ${email}`, async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = visible ? dialog.first() : page;
    const value = await scope.locator('input[disabled]').first().inputValue().catch(() => "");
    if (!value || !value.includes(email)) {
      noteStandardIssue(
        "CHANGE_PASSWORD_TARGET_MISMATCH",
        "Dialog đổi mật khẩu cần hiển thị đúng user mục tiêu",
        `email=${email}`
      );
    }
  });
}

function fillChangePasswordForm(I, newPassword) {
  I.usePlaywrightTo("fill change password form", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = visible ? dialog.first() : page;
    const inputs = scope.locator('input[type="text"], input[type="password"]');
    const count = await inputs.count();
    if (count < 1) {
      noteStandardIssue(
        "CHANGE_PASSWORD_INPUT_NOT_FOUND",
        "Form đổi mật khẩu cần có input mật khẩu",
        ""
      );
      return;
    }
    await inputs.nth(count - 1).fill(newPassword);
  });
}

function submitChangePassword(I) {
  I.usePlaywrightTo("submit change password", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = visible ? dialog.first() : page;
    const btn = scope
      .getByRole("button", { name: /Xác nhận|Đổi mật khẩu|Lưu|Cập nhật|Confirm|Save|OK/i })
      .first();
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
  });
}

function cancelChangePassword(I) {
  I.usePlaywrightTo("cancel change password", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = visible ? dialog.first() : page;
    const btn = scope.getByRole("button", { name: /Hủy|Cancel|Đóng|Close/i }).first();
    if ((await btn.count()) > 0) {
      await btn.click();
      return;
    }
    await page.keyboard.press("Escape");
  });
}

function expectChangePasswordSuccess(I, label) {
  I.usePlaywrightTo(`expect change password success ${label}`, async ({ page }) => {
    const dialog = page.getByRole("dialog").first();
    let closed = false;
    if ((await dialog.count()) > 0) {
      try {
        await dialog.waitFor({ state: "hidden", timeout: 8000 });
        closed = true;
      } catch {
        closed = false;
      }
    } else {
      closed = true;
    }
    const successToast = page.locator('text=/thành công|success/i');
    const hasSuccess = (await successToast.count()) > 0;
    if (!closed && !hasSuccess) {
      noteStandardIssue(
        "CHANGE_PASSWORD_NOT_SUCCESS",
        "Đổi mật khẩu hợp lệ phải thành công và đóng dialog",
        `label=${label}`
      );
    }
  });
}

function expectValidationError(I, pattern, label) {
  I.usePlaywrightTo(`expect validation error ${label}`, async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    if (!visible) {
      noteStandardIssue(
        "CHANGE_PASSWORD_DIALOG_CLOSED",
        "Form invalid phải giữ dialog mở và hiển thị lỗi",
        `label=${label}`
      );
      return;
    }
    const scope = dialog.first();
    const text = await scope.textContent().catch(() => "");
    const hasError =
      pattern.test(text || "") ||
      (await scope.locator('[aria-invalid="true"]').count()) > 0 ||
      (await scope.locator("text=/bắt buộc|required|tối thiểu|minimum/i").count()) > 0;
    if (!hasError) {
      noteStandardIssue(
        "CHANGE_PASSWORD_VALIDATION_MISSING",
        "Cần hiển thị lỗi validation rõ ràng",
        `label=${label}`
      );
    }
  });
}

function deleteUser(I, email) {
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

    page.once("dialog", (dialog) => dialog.accept());
    await deleteItem.click();
    await page.waitForTimeout(800);
  });
}

function verifyUserDeleted(I, email) {
  I.usePlaywrightTo(`verify user deleted ${email}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: email });
    const count = await row.count();
    if (count > 0) {
      noteStandardIssue(
        "USER_NOT_DELETED",
        "User phải biến mất khỏi danh sách sau khi xóa",
        `email=${email}`
      );
    }
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
    }
    await page.keyboard.press("Escape");
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
    }
    await page.keyboard.press("Escape");
  });
}

function assertFooterCountsNonNegative(I, label, entityLabel) {
  I.usePlaywrightTo(`assert footer counts non-negative ${label}`, async ({ page }) => {
    const regex = entityLabel === "users"
      ? /Hiển thị\s+\d+\s*\/\s*\d+\s*người dùng/i
      : /Hiển thị\s+\d+\s*\/\s*\d+\s*nhà hàng/i;
    const footer = page.locator("div").filter({ hasText: regex }).first();
    const text = await footer.textContent().catch(() => "");
    const match = text?.match(/Hiển thị\s+(\d+)\s*\/\s*(\d+)/i);
    if (!match) {
      noteStandardIssue("FOOTER_COUNT_MISSING", "Không thấy số lượng hiển thị ở footer", label);
      return;
    }
    const visible = Number(match[1]);
    const total = Number(match[2]);
    if (Number.isNaN(visible) || Number.isNaN(total)) {
      noteStandardIssue("FOOTER_COUNT_INVALID", "Số lượng hiển thị không hợp lệ", text || label);
      return;
    }
    if (visible < 0 || total < 0) {
      noteStandardIssue("FOOTER_COUNT_NEGATIVE", "Số lượng không được âm", text || label);
    }
    if (visible > total) {
      noteStandardIssue("FOOTER_COUNT_MISMATCH", "Số lượng hiển thị không thể lớn hơn tổng", text || label);
    }
  });
}

function assertRoleBreakdown(I, label) {
  I.usePlaywrightTo(`assert role breakdown ${label}`, async ({ page }) => {
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    if (count === 0) return;
    let missingRole = 0;
    for (let i = 0; i < count; i += 1) {
      const roleBadges = rows.nth(i).locator("td").nth(1).locator("span");
      const roleCount = await roleBadges.count();
      if (roleCount < 1) missingRole += 1;
    }
    if (missingRole > 0) {
      noteStandardIssue("ROLE_BREAKDOWN_MISSING", "Một số dòng không hiển thị role", `missing=${missingRole}`);
    }
  });
}

function assertStatusBreakdown(I, label, entityLabel) {
  I.usePlaywrightTo(`assert status breakdown ${label}`, async ({ page }) => {
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    if (count === 0) return;
    let activeCount = 0;
    let lockedCount = 0;
    for (let i = 0; i < count; i += 1) {
      const statusCell = entityLabel === "users"
        ? rows.nth(i).locator("td").nth(2)
        : rows.nth(i).locator("td").nth(2);
      const text = await statusCell.textContent().catch(() => "");
      if (/Active/i.test(text || "")) activeCount += 1;
      if (/Locked/i.test(text || "")) lockedCount += 1;
    }
    if (activeCount + lockedCount !== count) {
      noteStandardIssue(
        "STATUS_BREAKDOWN_MISMATCH",
        "Tổng Active + Locked không khớp số dòng",
        `active=${activeCount}, locked=${lockedCount}, rows=${count}`
      );
    }
  });
}

function assertPlanBreakdown(I, label) {
  I.usePlaywrightTo(`assert plan breakdown ${label}`, async ({ page }) => {
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    if (count === 0) return;
    const allowed = ["FREE", "PREMIUM", "ENTERPRISE"];
    let missingPlan = 0;
    let invalidPlan = 0;
    for (let i = 0; i < count; i += 1) {
      const planCell = rows.nth(i).locator("td").nth(1);
      const text = (await planCell.textContent().catch(() => "")).trim().toUpperCase();
      if (!text) {
        missingPlan += 1;
      } else if (!allowed.some((p) => text.includes(p))) {
        invalidPlan += 1;
      }
    }
    if (missingPlan > 0) {
      noteStandardIssue("PLAN_MISSING", "Một số nhà hàng thiếu gói dịch vụ", `missing=${missingPlan}`);
    }
    if (invalidPlan > 0) {
      noteStandardIssue("PLAN_INVALID", "Gói dịch vụ không hợp lệ", `invalid=${invalidPlan}`);
    }
  });
}

function reloadPage(I) {
  I.usePlaywrightTo("reload page", async ({ page }) => {
    await page.reload();
  });
  I.waitForElement("table", 10);
}

Scenario("[ITC_COMPREHENSIVE Complete] Tổng hợp ITC_5, 10, 12, 13, 15, 49", ({ I }) => {
  const itc5Drafts = [];
  const ownerDraft = {
    restaurantName: `ITC-Comp-Rest-${suffix()}`,
    ownerName: `Owner Comp ${suffix()}`,
    email: `owner_comp_${suffix()}@s2o.test`,
    password: OWNER_PASSWORD,
    address: "123 Comp Street",
    phoneNumber: "0909999999",
    planType: "Free",
  };
  const staffDraft = {
    email: `staff_comp_${suffix()}@s2o.test`,
    fullName: `Staff Comp ${suffix()}`,
    password: STAFF_PASSWORD,
    phoneNumber: "0901999999",
  };
  const sysadminTarget = {
    email: `sysadmin_comp_${suffix()}@s2o.test`,
    fullName: `Sysadmin Comp ${suffix()}`,
    password: "Admin@Test123",
  };

  let ownerCurrentPassword = ownerDraft.password;
  let staffCurrentPassword = staffDraft.password;
  let sysadminCurrentPassword = sysadminTarget.password;

  mark(I, "START");
  if (fs.existsSync(REPORT_PATH)) {
    fs.unlinkSync(REPORT_PATH);
  }

  loginAsAdmin(I);

  mark(I, "═══ PHASE 1: ITC_5 - Đăng ký nhà hàng ═══");
  goToRestaurants(I);
  clearRestaurantSearch(I);

  mark(I, "ITC_5.1-5.5: Đăng ký thành công với các gói");
  for (const plan of ["Free", "Premium", "Enterprise"]) {
    const d = {
      restaurantName: `ITC5-Plan-${plan}-${suffix()}`,
      ownerName: `Owner ${plan}`,
      email: `itc5_${plan}_${suffix()}@s2o.test`,
      password: "Abc@123456",
      address: `123 ITC5 ${plan}`,
      phoneNumber: "0909888888",
      planType: plan,
    };
    openTenantDialog(I);
    fillTenantDialog(I, d);
    submitTenantDialog(I);
    verifyRestaurantCreated(I, d.restaurantName);
    itc5Drafts.push(d);
  }

  mark(I, "ITC_5.6-5.11: Validation - Required fields");
  const requiredCases = [
    { id: "06", patch: { restaurantName: "" }, error: "Tên nhà hàng" },
    { id: "07", patch: { address: "" }, error: "Địa chỉ" },
    { id: "08", patch: { phoneNumber: "" }, error: "SĐT" },
    { id: "09", patch: { ownerName: "" }, error: "Họ tên" },
    { id: "10", patch: { email: "" }, error: "Email" },
    { id: "11", patch: { password: "" }, error: "Mật khẩu" },
  ];
  for (const c of requiredCases) {
    const d = {
      restaurantName: `ITC5-${c.id}-${suffix()}`,
      ownerName: `Owner ${c.id}`,
      email: `itc5_${c.id}_${suffix()}@s2o.test`,
      password: "Abc@123456",
      address: `123 ITC5 ${c.id}`,
      phoneNumber: "0909777777",
      planType: "Free",
      ...c.patch,
    };
    openTenantDialog(I);
    fillTenantDialog(I, d);
    submitTenantDialog(I);
    assertDialogError(I, c.error, `REQUIRED_${c.id}`);
    if (d.restaurantName && d.restaurantName.trim()) {
      verifyNotCreated(I, d.restaurantName);
    }
    closeTenantDialog(I, "cancel");
  }

  mark(I, "ITC_5.12: Validation - Invalid email");
  openTenantDialog(I);
  fillTenantDialog(I, {
    restaurantName: `ITC5-InvalidEmail-${suffix()}`,
    ownerName: "Owner",
    email: "invalid-email",
    password: "Abc@123456",
    address: "123 Street",
    phoneNumber: "0909666666",
    planType: "Free",
  });
  submitTenantDialog(I);
  assertDialogError(I, "Email", "INVALID_EMAIL");
  closeTenantDialog(I, "cancel");

  mark(I, "ITC_5.13-5.18: Validation - Password length");
  for (const len of [5, 6, 7, 28, 49, 50]) {
    const ok = len >= 6;
    const d = {
      restaurantName: `ITC5-Pass${len}-${suffix()}`,
      ownerName: "Owner",
      email: `itc5_pass${len}_${suffix()}@s2o.test`,
      password: passwordOfLength(len),
      address: "123 Street",
      phoneNumber: "0909555555",
      planType: "Free",
    };
    openTenantDialog(I);
    fillTenantDialog(I, d);
    submitTenantDialog(I);
    if (!ok) {
      assertDialogError(I, "Tối thiểu", `PASSWORD_LEN_${len}`);
      closeTenantDialog(I, "cancel");
    } else {
      verifyRestaurantCreated(I, d.restaurantName);
    }
  }

  mark(I, "ITC_5.19-5.21: Validation - Phone format");
  for (const phone of ["09ab!23456", "09012", "090912345678901234"]) {
    openTenantDialog(I);
    fillTenantDialog(I, {
      restaurantName: `ITC5-Phone-${suffix()}`,
      ownerName: "Owner",
      email: `itc5_phone_${suffix()}@s2o.test`,
      password: "Abc@123456",
      address: "123 Street",
      phoneNumber: phone,
      planType: "Free",
    });
    submitTenantDialog(I);
    assertDialogError(I, "SĐT", `INVALID_PHONE`);
    closeTenantDialog(I, "cancel");
  }

  mark(I, "ITC_5.22-5.23: Validation - Duplicate email & name");
  const dupEmail = `dup_email_${suffix()}@s2o.test`;
  openTenantDialog(I);
  fillTenantDialog(I, {
    restaurantName: `ITC5-DupEmail1-${suffix()}`,
    ownerName: "Owner",
    email: dupEmail,
    password: "Abc@123456",
    address: "123 Street",
    phoneNumber: "0909444444",
    planType: "Free",
  });
  submitTenantDialog(I);

  openTenantDialog(I);
  fillTenantDialog(I, {
    restaurantName: `ITC5-DupEmail2-${suffix()}`,
    ownerName: "Owner",
    email: dupEmail,
    password: "Abc@123456",
    address: "123 Street",
    phoneNumber: "0909444444",
    planType: "Free",
  });
  submitTenantDialog(I);
  assertDialogError(I, "Email đã tồn tại", "DUP_EMAIL");
  closeTenantDialog(I, "cancel");

  mark(I, "═══ PHASE 2: Tạo owner & staff ═══");
  openTenantDialog(I);
  fillTenantDialog(I, ownerDraft);
  submitTenantDialog(I);
  ensureRestaurantCreated(I, ownerDraft.restaurantName);
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerDraft.password, true, "OWNER_CREATED");
  loginAsOwner(I, ownerDraft.email, ownerDraft.password);
  goToOwnerStaff(I);
  createStaff(I, staffDraft);

  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  createSystemAdmin(I, sysadminTarget.email, sysadminTarget.fullName, sysadminTarget.password);

  mark(I, "═══ PHASE 3: ITC_15 - Thống kê người dùng (baseline) ═══");
  goToUsers(I);
  clearUserSearch(I);
  assertFooterCountsNonNegative(I, "USERS_BASELINE", "users");
  assertRoleBreakdown(I, "USERS_BASELINE");
  assertStatusBreakdown(I, "USERS_BASELINE", "users");

  mark(I, "═══ PHASE 4: ITC_49 - Thống kê nhà hàng (baseline) ═══");
  goToRestaurants(I);
  clearRestaurantSearch(I);
  assertFooterCountsNonNegative(I, "REST_BASELINE", "restaurants");
  assertStatusBreakdown(I, "REST_BASELINE", "restaurants");
  assertPlanBreakdown(I, "REST_BASELINE");

  mark(I, "═══ PHASE 5: ITC_10 - Khóa/mở khóa người dùng ═══");
  goToUsers(I);
  searchUser(I, staffDraft.email);
  ensureUserRow(I, staffDraft.email);
  expectStatus(I, staffDraft.email, "Active");
  expectMenuAction(I, staffDraft.email, "lock");

  searchUser(I, ownerDraft.email);
  ensureUserRow(I, ownerDraft.email);
  expectStatus(I, ownerDraft.email, "Active");
  expectMenuAction(I, ownerDraft.email, "lock");

  searchUser(I, sysadminTarget.email);
  ensureUserRow(I, sysadminTarget.email);
  expectStatus(I, sysadminTarget.email, "Active");
  expectMenuAction(I, sysadminTarget.email, "lock");

  mark(I, "ITC_10.2: Lock staff");
  searchUser(I, staffDraft.email);
  toggleLock(I, staffDraft.email, "Khóa");
  expectStatus(I, staffDraft.email, "Locked");
  expectMenuAction(I, staffDraft.email, "unlock");

  mark(I, "ITC_10.2-10.3: Lock owner & verify login fails");
  searchUser(I, ownerDraft.email);
  toggleLock(I, ownerDraft.email, "Khóa");
  expectStatus(I, ownerDraft.email, "Locked");

  mark(I, "ITC_10.2-10.3: Lock sysadmin & verify login fails");
  searchUser(I, sysadminTarget.email);
  toggleLock(I, sysadminTarget.email, "Khóa");
  expectStatus(I, sysadminTarget.email, "Locked");

  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffCurrentPassword, false, "STAFF_LOCKED");
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerCurrentPassword, false, "OWNER_LOCKED");
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminCurrentPassword, false, "SYSADMIN_LOCKED");

  mark(I, "ITC_10.4-10.5: Unlock all & verify login success");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);

  searchUser(I, staffDraft.email);
  toggleLock(I, staffDraft.email, "Mở khóa");
  expectStatus(I, staffDraft.email, "Active");

  searchUser(I, ownerDraft.email);
  toggleLock(I, ownerDraft.email, "Mở khóa");
  expectStatus(I, ownerDraft.email, "Active");

  searchUser(I, sysadminTarget.email);
  toggleLock(I, sysadminTarget.email, "Mở khóa");
  expectStatus(I, sysadminTarget.email, "Active");

  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffCurrentPassword, true, "STAFF_UNLOCKED");
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerCurrentPassword, true, "OWNER_UNLOCKED");
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminCurrentPassword, true, "SYSADMIN_UNLOCKED");

  mark(I, "ITC_10.14: Verify self-lock blocked");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, ADMIN_EMAIL);
  expectSelfLockBlocked(I, ADMIN_EMAIL);

  mark(I, "═══ PHASE 6: ITC_13 - Đổi mật khẩu ═══");
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  expectChangePasswordTarget(I, staffDraft.email);
  cancelChangePassword(I);

  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, "Staff@123New");
  submitChangePassword(I);
  expectChangePasswordSuccess(I, "STAFF_CHANGE");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffCurrentPassword, false, "STAFF_OLD_FAIL");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, "Staff@123New", true, "STAFF_NEW_OK");
  staffCurrentPassword = "Staff@123New";

  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  openChangePasswordDialog(I, ownerDraft.email);
  fillChangePasswordForm(I, "Owner@123New");
  submitChangePassword(I);
  expectChangePasswordSuccess(I, "OWNER_CHANGE");
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerCurrentPassword, false, "OWNER_OLD_FAIL");
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, "Owner@123New", true, "OWNER_NEW_OK");
  ownerCurrentPassword = "Owner@123New";

  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  openChangePasswordDialog(I, sysadminTarget.email);
  fillChangePasswordForm(I, "Admin@123New");
  submitChangePassword(I);
  expectChangePasswordSuccess(I, "SYSADMIN_CHANGE");
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminCurrentPassword, false, "SYSADMIN_OLD_FAIL");
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, "Admin@123New", true, "SYSADMIN_NEW_OK");
  sysadminCurrentPassword = "Admin@123New";

  mark(I, "ITC_13.11-13.13: Validation");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, "");
  submitChangePassword(I);
  expectValidationError(I, /bắt buộc|required/i, "EMPTY_PASSWORD");
  cancelChangePassword(I);

  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, passwordOfLength(5));
  submitChangePassword(I);
  expectValidationError(I, /tối thiểu|minimum|6/i, "PASSWORD_TOO_SHORT");
  cancelChangePassword(I);

  mark(I, "═══ PHASE 7: ITC_12 - Xóa người dùng ═══");
  goToUsers(I);
  searchUser(I, staffDraft.email);
  deleteUser(I, staffDraft.email);
  verifyUserDeleted(I, staffDraft.email);
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffCurrentPassword, false, "STAFF_DELETED");

  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, ownerDraft.email);
  deleteUser(I, ownerDraft.email);
  verifyUserDeleted(I, ownerDraft.email);

  searchUser(I, sysadminTarget.email);
  deleteUser(I, sysadminTarget.email);
  verifyUserDeleted(I, sysadminTarget.email);
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminCurrentPassword, false, "SYSADMIN_DELETED");

  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  searchUser(I, ADMIN_EMAIL);
  expectSelfDeleteBlocked(I, ADMIN_EMAIL);

  mark(I, "═══ PHASE 8: Final stats check ═══");
  goToUsers(I);
  clearUserSearch(I);
  assertFooterCountsNonNegative(I, "USERS_FINAL", "users");

  goToRestaurants(I);
  clearRestaurantSearch(I);
  assertFooterCountsNonNegative(I, "REST_FINAL", "restaurants");

  mark(I, "END");
});
