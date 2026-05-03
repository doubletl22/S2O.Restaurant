Feature("ITC_49 - Thống kê nhà hàng");

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@s2o.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Owner@123";

const REPORT_PATH = path.join(__dirname, "itc49_report.txt");

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

    const nameInput = page
      .locator('input[placeholder="Kichi Kichi..."], input[placeholder*="Kichi"]')
      .first();
    await nameInput.waitFor({ state: "visible", timeout: 15000 });
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

function searchRestaurant(I, keyword) {
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
    await input.fill(keyword);
    await page.waitForTimeout(700);
  });
}

function clearSearch(I) {
  I.usePlaywrightTo("clear search", async ({ page }) => {
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

function expectPageWidgets(I) {
  I.waitForText("Quản lý Đối tác", 10);
  I.waitForElement(
    'input[placeholder*="Tìm theo Tên"], input[placeholder*="Tim theo Ten"], input[placeholder*="ID..."]',
    10
  );
  I.see("Nhà hàng");
  I.see("Gói cước");
  I.see("Trạng thái");
  I.see("Ngày tạo");
}

function assertFooterCountsNonNegative(I, label) {
  I.usePlaywrightTo(`assert footer counts non-negative ${label}`, async ({ page }) => {
    const footer = page.locator("div").filter({ hasText: /Hiển thị\s+\d+\s*\/\s*\d+\s*nhà hàng/i }).first();
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
    const footer = page.locator("div").filter({ hasText: /Hiển thị\s+\d+\s*\/\s*\d+\s*nhà hàng/i }).first();
    const text = await footer.textContent().catch(() => "");
    const match = text?.match(/Hiển thị\s+(\d+)\s*\/\s*(\d+)/i);
    if (!match) return;
    const visible = Number(match[1]);
    const noData =
      (await page.getByText("Không tìm thấy nhà hàng phù hợp với từ khóa.").count()) > 0 ||
      (await page.getByText("Không có nhà hàng nào trong hệ thống.").count()) > 0;
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
      if (!/Active|Locked/i.test(text || "")) {
        noteStandardIssue(
          "STATUS_BADGE_MISSING",
          "Trạng thái nhà hàng cần hiển thị rõ Active/Locked",
          `row=${i + 1}`
        );
      }
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

function assertFilteredRowsContain(I, keyword, label) {
  I.usePlaywrightTo(`assert filtered rows contain ${label}`, async ({ page }) => {
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    for (let i = 0; i < count; i += 1) {
      const text = await rows.nth(i).textContent().catch(() => "");
      if (text && !text.toLowerCase().includes(keyword.toLowerCase())) {
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

function checkFilterControls(I) {
  I.usePlaywrightTo("check filter controls", async ({ page }) => {
    const hasStatus =
      (await page.getByRole("combobox", { name: /Trạng thái|Status/i }).count()) > 0 ||
      (await page.locator("select").filter({ hasText: /Trạng thái|Status/i }).count()) > 0;
    if (!hasStatus) {
      writeReport("GHI_CHU: Không thấy filter trạng thái trên trang /sysadmin/restaurants.");
    }

    const hasPlan =
      (await page.getByRole("combobox", { name: /Gói|Plan/i }).count()) > 0 ||
      (await page.locator("select").filter({ hasText: /Gói|Plan/i }).count()) > 0;
    if (!hasPlan) {
      writeReport("GHI_CHU: Không thấy filter gói dịch vụ trên trang /sysadmin/restaurants.");
    }

    const hasDate = (await page.locator('input[type="date"]').count()) > 0;
    if (!hasDate) {
      writeReport("GHI_CHU: Không thấy filter thời gian tạo nhà hàng trên trang /sysadmin/restaurants.");
    }
  });
}

function reloadPage(I) {
  I.usePlaywrightTo("reload page", async ({ page }) => {
    await page.reload();
  });
  I.waitForElement("table", 10);
}

function tryPagination(I) {
  I.usePlaywrightTo("try pagination", async ({ page }) => {
    const pageText = await page.locator("span").filter({ hasText: /Trang\s+\d+\/\d+/i }).first().textContent();
    if (!pageText) return;
    const match = pageText.match(/Trang\s+(\d+)\/(\d+)/i);
    if (!match) return;
    const current = Number(match[1]);
    const total = Number(match[2]);
    if (total <= 1) {
      writeReport("GHI_CHU: Không đủ dữ liệu để test phân trang.");
      return;
    }
    const nextBtn = page.getByRole("button", { name: /Sau/i }).first();
    if (await nextBtn.isDisabled()) return;
    await nextBtn.click();
    await page.waitForTimeout(600);
    const newText = await page.locator("span").filter({ hasText: /Trang\s+\d+\/\d+/i }).first().textContent();
    if (newText && !newText.includes(`Trang ${current + 1}/`)) {
      noteStandardIssue("PAGINATION_NOT_UPDATED", "Chuyển trang không cập nhật số trang", newText || "");
    }
  });
}

let slowApiApplied = false;
let slowApiTriggered = false;
function simulateSlowTenantsApi(I, delayMs = 2000) {
  I.usePlaywrightTo("simulate slow tenants api", async ({ page }) => {
    if (slowApiApplied) return;
    slowApiApplied = true;
    await page.route(/\/api\/v1\/tenants/, async (route) => {
      if (!slowApiTriggered) {
        slowApiTriggered = true;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      await route.continue();
    });
  });
}

Scenario("[ITC_49 Complete] Thống kê nhà hàng", ({ I }) => {
  const ownerDraft = {
    restaurantName: `ITC49-Rest-${suffix()}`,
    ownerName: `Owner ITC49 ${suffix()}`,
    email: `owner_itc49_${suffix()}@s2o.test`,
    password: OWNER_PASSWORD,
    address: "123 ITC49 Street",
    phoneNumber: "0909123456",
    planType: "Free",
  };

  mark(I, "START");
  if (fs.existsSync(REPORT_PATH)) {
    fs.unlinkSync(REPORT_PATH);
  }

  loginAsAdmin(I);
  createOwnerTenant(I, ownerDraft);
  goToRestaurants(I);
  clearSearch(I);

  mark(I, "ITC_49.1");
  expectPageWidgets(I);

  mark(I, "ITC_49.2");
  assertFooterCountsNonNegative(I, "BASELINE");

  mark(I, "ITC_49.3");
  assertStatusBreakdown(I, "BASELINE");

  mark(I, "ITC_49.4");
  assertPlanBreakdown(I, "BASELINE");

  mark(I, "ITC_49.5 (Search theo tên)");
  searchRestaurant(I, ownerDraft.restaurantName);
  assertFilteredRowsContain(I, ownerDraft.restaurantName, "FILTER_BY_NAME");

  mark(I, "ITC_49.5 (Search theo ID)");
  I.usePlaywrightTo("search by id", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: ownerDraft.restaurantName }).first();
    if ((await row.count()) < 1) return;
    const idText = await row.locator("td").first().textContent().catch(() => "");
    const idLine = (idText || "").split("\n").map((v) => v.trim()).filter(Boolean).pop();
    if (idLine) {
      await page
        .locator(
          [
            'input[placeholder*="Tìm theo Tên"]',
            'input[placeholder*="Tim theo Ten"]',
            'input[placeholder*="ID..."]',
            'input[placeholder*="Tìm kiếm nhà hàng"]',
            'input[placeholder*="Tim kiem nha hang"]',
          ].join(", ")
        )
        .first()
        .fill(idLine);
      await page.waitForTimeout(700);
    }
  });
  assertFilteredRowsContain(I, ownerDraft.restaurantName, "FILTER_BY_ID");

  mark(I, "ITC_49.6-49.8 (Filter trạng thái/gói/thời gian nếu có)");
  checkFilterControls(I);

  mark(I, "ITC_49.9 (Phân trang)");
  clearSearch(I);
  assertRowCountMatchesFooter(I, "PAGINATION_BASELINE");
  tryPagination(I);

  mark(I, "ITC_49.10 (Reload sau filter)");
  searchRestaurant(I, ownerDraft.restaurantName);
  reloadPage(I);
  I.usePlaywrightTo("verify filter after reload", async ({ page }) => {
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
    const value = await input.inputValue();
    if (value && value.trim()) {
      writeReport(`GHI_CHU: Reload giữ filter = "${value}".`);
    } else {
      writeReport("GHI_CHU: Reload reset filter về rỗng.");
    }
  });

  mark(I, "ITC_49.11 (User không đủ quyền)");
  clearAuthState(I);
  loginAsOwner(I, ownerDraft.email, ownerDraft.password);
  I.amOnPage(`${BASE_URL}/sysadmin/restaurants`);
  I.wait(1);
  I.usePlaywrightTo("verify unauthorized access", async ({ page }) => {
    const url = page.url();
    const hasErrorBanner = (await page.getByText("Truy cập bị từ chối").count()) > 0;
    if (url.includes("/sysadmin/restaurants") && !hasErrorBanner) {
      noteStandardIssue(
        "UNAUTHORIZED_ACCESS",
        "User không đủ quyền vẫn truy cập /sysadmin/restaurants",
        url
      );
    } else {
      writeReport(`GHI_CHU: Non-admin bị chặn hoặc redirect: ${url}`);
    }
  });

  mark(I, "ITC_49.12 (API chậm -> loading)");
  clearAuthState(I);
  loginAsAdmin(I);
  simulateSlowTenantsApi(I, 2000);
  I.amOnPage(`${BASE_URL}/sysadmin/restaurants`);
  I.waitForText("Đang tải...", 5);

  mark(I, "END");
});
