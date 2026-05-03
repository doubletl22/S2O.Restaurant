Feature("ITC_15 - Thống kê người dùng");

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@s2o.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@123";

const REPORT_PATH = path.join(__dirname, "itc15_report.txt");

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

function clearSearch(I) {
  I.usePlaywrightTo("clear search input", async ({ page }) => {
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
    await page.waitForTimeout(600);
  });
}

function expectPageWidgets(I) {
  I.waitForText("Tài khoản Hệ thống", 10);
  I.waitForElement(
    'input[placeholder="Tìm user..."], input[placeholder*="Tìm user"], input[placeholder*="Tim user"]',
    10
  );
  I.see("Hành động");
}

function assertFooterCountsNonNegative(I, label) {
  I.usePlaywrightTo(`assert footer counts non-negative ${label}`, async ({ page }) => {
    const footer = page.locator("div").filter({ hasText: /Hiển thị\s+\d+\s*\/\s*\d+\s*người dùng/i }).first();
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

function assertRowCountMatchesFooter(I, label) {
  I.usePlaywrightTo(`assert row count matches footer ${label}`, async ({ page }) => {
    const footer = page.locator("div").filter({ hasText: /Hiển thị\s+\d+\s*\/\s*\d+\s*người dùng/i }).first();
    const text = await footer.textContent().catch(() => "");
    const match = text?.match(/Hiển thị\s+(\d+)\s*\/\s*(\d+)/i);
    if (!match) return;
    const visible = Number(match[1]);

    const noData = (await page.getByText("Không có dữ liệu.").count()) > 0;
    if (noData && visible !== 0) {
      noteStandardIssue("ROW_COUNT_NO_DATA_MISMATCH", "Không có dữ liệu nhưng footer không phải 0", text || label);
      return;
    }

    const rows = await page.locator("tbody tr").count();
    const effectiveRows = noData ? 0 : rows;
    if (effectiveRows !== visible) {
      noteStandardIssue(
        "ROW_COUNT_MISMATCH",
        "Số dòng hiển thị không khớp footer",
        `rows=${effectiveRows}, footer=${visible}`
      );
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
      noteStandardIssue(
        "ROLE_BREAKDOWN_MISSING",
        "Một số dòng không hiển thị role",
        `missing=${missingRole}`
      );
    }
  });
}

function assertStatusBreakdown(I, label) {
  I.usePlaywrightTo(`assert status breakdown ${label}`, async ({ page }) => {
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    if (count === 0) return;
    let activeCount = 0;
    let lockedCount = 0;
    for (let i = 0; i < count; i += 1) {
      const statusCell = rows.nth(i).locator("td").nth(2);
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

function assertFilteredRowsContain(I, keyword, label) {
  I.usePlaywrightTo(`assert filtered rows contain ${label}`, async ({ page }) => {
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    for (let i = 0; i < count; i += 1) {
      const text = await rows.nth(i).textContent().catch(() => "");
      if (text && !text.includes(keyword)) {
        noteStandardIssue(
          "FILTER_MISMATCH",
          "Dữ liệu hiển thị không khớp filter keyword",
          `keyword=${keyword}`
        );
        break;
      }
    }
  });
}

function checkTenantBranchFilters(I) {
  I.usePlaywrightTo("check tenant/branch filter", async ({ page }) => {
    const hasTenant =
      (await page.getByRole("combobox", { name: /Nhà hàng|Tenant|Chi nhánh|Branch/i }).count()) > 0 ||
      (await page.locator("select").filter({ hasText: /Nhà hàng|Tenant|Chi nhánh|Branch/i }).count()) > 0;
    if (!hasTenant) {
      writeReport("GHI_CHU: Không có filter tenant/branch trên trang /sysadmin/users.");
    }
  });
}

function reloadPage(I) {
  I.usePlaywrightTo("reload page", async ({ page }) => {
    await page.reload();
  });
  I.waitForElement("table", 10);
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

function toggleLock(I, email, actionLabel) {
  I.usePlaywrightTo(`toggle lock for ${email}`, async ({ page }) => {
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

function assertCountsForFiltered(I, expectedVisible, expectedTotal, label) {
  I.usePlaywrightTo(`assert counts for filtered ${label}`, async ({ page }) => {
    const footer = page.locator("div").filter({ hasText: /Hiển thị\s+\d+\s*\/\s*\d+\s*người dùng/i }).first();
    const text = await footer.textContent().catch(() => "");
    const match = text?.match(/Hiển thị\s+(\d+)\s*\/\s*(\d+)/i);
    if (!match) return;
    const visible = Number(match[1]);
    const total = Number(match[2]);
    if (visible !== expectedVisible || total !== expectedTotal) {
      noteStandardIssue(
        "FILTER_COUNT_MISMATCH",
        "Số lượng sau filter không như mong đợi",
        `expected=${expectedVisible}/${expectedTotal}, actual=${visible}/${total}`
      );
    }
  });
}

let slowApiApplied = false;
let slowApiTriggered = false;
function simulateSlowUsersApi(I, delayMs = 2000) {
  I.usePlaywrightTo("simulate slow users api", async ({ page }) => {
    if (slowApiApplied) return;
    slowApiApplied = true;
    await page.route(/\/api\/users/, async (route) => {
      if (!slowApiTriggered) {
        slowApiTriggered = true;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      await route.continue();
    });
  });
}

Scenario("[ITC_15 Complete] Thống kê người dùng", ({ I }) => {
  const ownerDraft = {
    restaurantName: `ITC15-Rest-${suffix()}`,
    ownerName: `Owner ITC15 ${suffix()}`,
    email: `owner_itc15_${suffix()}@s2o.test`,
    password: OWNER_PASSWORD,
    address: "123 ITC15 Street",
    phoneNumber: "0909123456",
    planType: "Free",
  };
  const tempAdmin = {
    email: `sysadmin_stats_${suffix()}@s2o.test`,
    fullName: `Sysadmin Stats ${suffix()}`,
    password: "Admin@Test123",
  };

  mark(I, "START");
  if (fs.existsSync(REPORT_PATH)) {
    fs.unlinkSync(REPORT_PATH);
  }

  loginAsAdmin(I);
  createOwnerTenant(I, ownerDraft);
  goToUsers(I);

  mark(I, "ITC_15.1");
  expectPageWidgets(I);

  mark(I, "ITC_15.2");
  assertFooterCountsNonNegative(I, "BASELINE");

  mark(I, "ITC_15.3");
  assertRowCountMatchesFooter(I, "BASELINE");

  mark(I, "ITC_15.4");
  assertRoleBreakdown(I, "BASELINE");

  mark(I, "ITC_15.5");
  assertStatusBreakdown(I, "BASELINE");

  mark(I, "ITC_15.6 (Filter theo email admin)");
  searchUser(I, ADMIN_EMAIL);
  assertFilteredRowsContain(I, ADMIN_EMAIL, "FILTER_ADMIN");
  assertFooterCountsNonNegative(I, "FILTER_ADMIN");

  mark(I, "ITC_15.7 (Filter theo owner)");
  searchUser(I, ownerDraft.email);
  assertFilteredRowsContain(I, ownerDraft.email, "FILTER_OWNER");
  assertFooterCountsNonNegative(I, "FILTER_OWNER");

  mark(I, "ITC_15.8 (Reset filter)");
  clearSearch(I);
  assertFooterCountsNonNegative(I, "RESET_FILTER");

  mark(I, "ITC_15.9 (Filter tenant/branch nếu có)");
  checkTenantBranchFilters(I);

  mark(I, "ITC_15.10 (Reload sau khi filter)");
  searchUser(I, ADMIN_EMAIL);
  reloadPage(I);
  I.usePlaywrightTo("verify filter after reload", async ({ page }) => {
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
    const value = await input.inputValue();
    if (value && value.trim()) {
      writeReport(`GHI_CHU: Reload giữ filter = "${value}".`);
    } else {
      writeReport("GHI_CHU: Reload reset filter về rỗng.");
    }
  });
  clearSearch(I);

  mark(I, "ITC_15.11 (User không đủ quyền)");
  clearAuthState(I);
  loginAsOwner(I, ownerDraft.email, ownerDraft.password);
  I.amOnPage(`${BASE_URL}/sysadmin/users`);
  I.wait(1);
  I.usePlaywrightTo("verify unauthorized access", async ({ page }) => {
    const url = page.url();
    if (url.includes("/sysadmin/users")) {
      noteStandardIssue(
        "UNAUTHORIZED_ACCESS",
        "User không đủ quyền vẫn truy cập /sysadmin/users",
        url
      );
    } else {
      writeReport(`GHI_CHU: Non-admin bị chặn hoặc redirect: ${url}`);
    }
  });

  mark(I, "ITC_15.12 (API chậm -> loading)");
  clearAuthState(I);
  loginAsAdmin(I);
  simulateSlowUsersApi(I, 2000);
  I.amOnPage(`${BASE_URL}/sysadmin/users`);
  I.waitForText("Đang tải...", 5);

  mark(I, "ITC_15.13 (Đổi filter nhanh nhiều lần)");
  goToUsers(I);
  I.usePlaywrightTo("rapid filter change", async ({ page }) => {
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
    await input.fill(ADMIN_EMAIL);
    await page.waitForTimeout(200);
    await input.fill(ownerDraft.email);
    await page.waitForTimeout(200);
    await input.fill("sysadmin");
    await page.waitForTimeout(200);
    await input.fill("");
  });
  I.waitForElement("table", 10);

  mark(I, "ITC_15.14 (Tạo user, khóa, xóa rồi kiểm tra)");
  goToUsers(I);
  createSystemAdmin(I, tempAdmin.email, tempAdmin.fullName, tempAdmin.password);
  searchUser(I, tempAdmin.email);
  assertCountsForFiltered(I, 1, 1, "AFTER_CREATE");
  toggleLock(I, tempAdmin.email, /Khóa|Khoa/i);
  assertStatusBreakdown(I, "AFTER_LOCK");
  deleteUser(I, tempAdmin.email);
  searchUser(I, tempAdmin.email);
  assertCountsForFiltered(I, 0, 0, "AFTER_DELETE");

  mark(I, "END");
});
