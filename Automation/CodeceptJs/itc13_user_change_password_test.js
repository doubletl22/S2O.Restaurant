Feature("ITC_13 - Đổi mật khẩu người dùng");

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@s2o.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "Staff@123";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@123";

const REPORT_PATH = path.join(__dirname, "itc13_report.txt");

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
    const passInput = page.locator('input[type="password"]').first();
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
    const text = await scope.textContent().catch(() => "");
    if (!text || !text.includes(email)) {
      noteStandardIssue(
        "CHANGE_PASSWORD_TARGET_MISMATCH",
        "Dialog đổi mật khẩu cần hiển thị đúng user mục tiêu",
        `email=${email}`
      );
    }
  });
}

function fillChangePasswordForm(I, newPassword, confirmPassword = newPassword) {
  I.usePlaywrightTo("fill change password form", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = visible ? dialog.first() : page;
    const inputs = scope.locator('input[type="password"]');
    const count = await inputs.count();
    if (count < 1) {
      noteStandardIssue(
        "CHANGE_PASSWORD_INPUT_NOT_FOUND",
        "Form đổi mật khẩu cần có input mật khẩu",
        ""
      );
      return;
    }
    await inputs.nth(0).fill(newPassword);
    if (count > 1) {
      await inputs.nth(1).fill(confirmPassword);
    }
  });
}

function submitChangePassword(I, { doubleSubmit = false } = {}) {
  I.usePlaywrightTo("submit change password", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));
    const scope = visible ? dialog.first() : page;
    const btn = scope
      .getByRole("button", { name: /Xác nhận|Đổi mật khẩu|Lưu|Cập nhật|Confirm|Save|OK/i })
      .first();
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
    if (doubleSubmit) {
      await btn.click();
    }
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
    if (!hasSuccess) {
      writeReport(`GHI_CHU: Không thấy toast thành công ở bước ${label}.`);
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
        "Mật khẩu cũ phải bị chặn sau khi đổi",
        `email=${email}`
      );
    }
  });
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

Scenario("[ITC_13 Complete] Đổi mật khẩu user cho staff/owner/systemadmin", ({ I }) => {
  const ownerDraft = {
    restaurantName: `ITC13-Rest-${suffix()}`,
    ownerName: `Owner ITC13 ${suffix()}`,
    email: `owner_itc13_${suffix()}@s2o.test`,
    password: OWNER_PASSWORD,
    address: "123 ITC13 Street",
    phoneNumber: "0909123456",
    planType: "Free",
  };
  const staffDraft = {
    email: `staff_itc13_${suffix()}@s2o.test`,
    fullName: `Staff ITC13 ${suffix()}`,
    password: STAFF_PASSWORD,
    phoneNumber: "0901234567",
  };
  const sysadminTarget = {
    email: `sysadmin_change_${suffix()}@s2o.test`,
    fullName: `Sysadmin Change ${suffix()}`,
    password: "Admin@Test123",
  };

  const staffNewPassword = "Staff@123New";
  const ownerNewPassword = "Owner@123New";
  const sysadminNewPassword = "Admin@123New";

  let staffCurrentPassword = staffDraft.password;
  let ownerCurrentPassword = ownerDraft.password;
  let sysadminCurrentPassword = sysadminTarget.password;

  mark(I, "START");
  if (fs.existsSync(REPORT_PATH)) {
    fs.unlinkSync(REPORT_PATH);
  }
  loginAsAdmin(I);
  createOwnerTenant(I, ownerDraft);
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerDraft.password, true, "OWNER_CREATED");
  loginAsOwner(I, ownerDraft.email, ownerDraft.password);
  I.amOnPage(`${BASE_URL}/owner/staff`);
  I.waitInUrl("/owner/staff", 10);
  createStaff(I, staffDraft);
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  createSystemAdmin(I, sysadminTarget.email, sysadminTarget.fullName, sysadminTarget.password);

  mark(I, "ITC_13.1");
  searchUser(I, staffDraft.email);
  ensureUserRow(I, staffDraft.email);
  expectRole(I, staffDraft.email, /Staff|Waiter|Chef|Manager/i);
  expectStatus(I, staffDraft.email, "Active");
  openChangePasswordDialog(I, staffDraft.email);
  expectChangePasswordTarget(I, staffDraft.email);
  cancelChangePassword(I);

  mark(I, "ITC_13.2-13.4 (Staff đổi mật khẩu -> login cũ fail, mới pass)");
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, staffNewPassword, staffNewPassword);
  submitChangePassword(I);
  expectChangePasswordSuccess(I, "STAFF_CHANGE_1");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffCurrentPassword, false, "STAFF_OLD_FAIL");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffNewPassword, true, "STAFF_NEW_OK");
  staffCurrentPassword = staffNewPassword;

  mark(I, "ITC_13.5-13.7 (Owner đổi mật khẩu -> login cũ fail, mới pass)");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  openChangePasswordDialog(I, ownerDraft.email);
  fillChangePasswordForm(I, ownerNewPassword, ownerNewPassword);
  submitChangePassword(I);
  expectChangePasswordSuccess(I, "OWNER_CHANGE_1");
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerCurrentPassword, false, "OWNER_OLD_FAIL");
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerNewPassword, true, "OWNER_NEW_OK");
  ownerCurrentPassword = ownerNewPassword;

  mark(I, "ITC_13.8-13.10 (Systemadmin đổi mật khẩu -> login cũ fail, mới pass)");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  openChangePasswordDialog(I, sysadminTarget.email);
  fillChangePasswordForm(I, sysadminNewPassword, sysadminNewPassword);
  submitChangePassword(I);
  expectChangePasswordSuccess(I, "SYSADMIN_CHANGE_1");
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminCurrentPassword, false, "SYSADMIN_OLD_FAIL");
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminNewPassword, true, "SYSADMIN_NEW_OK");
  sysadminCurrentPassword = sysadminNewPassword;

  mark(I, "ITC_13.11 (Bỏ trống mật khẩu mới)");
  clearAuthState(I);
  loginAsAdmin(I);
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, "", "");
  submitChangePassword(I);
  expectValidationError(I, /bắt buộc|required/i, "EMPTY_PASSWORD");
  cancelChangePassword(I);

  mark(I, "ITC_13.12 (Mật khẩu mới dưới ngưỡng tối thiểu)");
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, passwordOfLength(5), passwordOfLength(5));
  submitChangePassword(I);
  expectValidationError(I, /tối thiểu|minimum|6/i, "PASSWORD_TOO_SHORT");
  cancelChangePassword(I);

  mark(I, "ITC_13.13 (Mật khẩu đúng ngưỡng tối thiểu)");
  goToUsers(I);
  const minPassword = passwordOfLength(6);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, minPassword, minPassword);
  submitChangePassword(I);
  expectChangePasswordSuccess(I, "PASSWORD_MIN");
  staffCurrentPassword = minPassword;

  mark(I, "ITC_13.14 (Mật khẩu dài trong ngưỡng cho phép)");
  const longPassword = passwordOfLength(32);
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, longPassword, longPassword);
  submitChangePassword(I);
  expectChangePasswordSuccess(I, "PASSWORD_LONG");
  staffCurrentPassword = longPassword;

  mark(I, "ITC_13.15 (Đổi mật khẩu trùng hiện tại)");
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, staffCurrentPassword, staffCurrentPassword);
  submitChangePassword(I);
  I.usePlaywrightTo("check same password behavior", async ({ page }) => {
    const dialog = page.getByRole("dialog").first();
    const stillOpen = (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));
    const text = await page.textContent("body").catch(() => "");
    const hasError = /trùng|same|giống|không được trùng/i.test(text || "");
    const hasSuccess = /thành công|success/i.test(text || "");
    if (!stillOpen && hasSuccess) {
      writeReport("GHI_CHU: Hệ thống cho phép đổi mật khẩu trùng với mật khẩu hiện tại.");
    } else if (stillOpen && hasError) {
      writeReport("GHI_CHU: Hệ thống chặn đổi mật khẩu trùng với mật khẩu hiện tại.");
      await page.keyboard.press("Escape");
    } else {
      noteStandardIssue(
        "CHANGE_PASSWORD_SAME_UNCLEAR",
        "Cần phản hồi rõ ràng khi đổi mật khẩu trùng hiện tại",
        "Không thấy trạng thái thành công hoặc lỗi rõ ràng"
      );
    }
  });

  mark(I, "ITC_13.16 (Bấm xác nhận 2 lần)");
  const doubleSubmitPass = passwordOfLength(8);
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, doubleSubmitPass, doubleSubmitPass);
  submitChangePassword(I, { doubleSubmit: true });
  expectChangePasswordSuccess(I, "DOUBLE_SUBMIT");
  staffCurrentPassword = doubleSubmitPass;

  mark(I, "ITC_13.17 (Hủy đổi mật khẩu)");
  const cancelPass = passwordOfLength(10);
  goToUsers(I);
  openChangePasswordDialog(I, staffDraft.email);
  fillChangePasswordForm(I, cancelPass, cancelPass);
  cancelChangePassword(I);
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffCurrentPassword, true, "CANCEL_OLD_OK");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, cancelPass, false, "CANCEL_NEW_FAIL");

  mark(I, "ITC_13.18 (Luồng tổng hợp: cũ fail, mới pass)");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffDraft.password, false, "STAFF_ORIGINAL_FAIL");
  clearAuthState(I);
  attemptLogin(I, staffDraft.email, staffCurrentPassword, true, "STAFF_CURRENT_OK");
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerDraft.password, false, "OWNER_ORIGINAL_FAIL");
  clearAuthState(I);
  attemptLogin(I, ownerDraft.email, ownerCurrentPassword, true, "OWNER_CURRENT_OK");
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminTarget.password, false, "SYSADMIN_ORIGINAL_FAIL");
  clearAuthState(I);
  attemptLogin(I, sysadminTarget.email, sysadminCurrentPassword, true, "SYSADMIN_CURRENT_OK");

  mark(I, "END");
});
