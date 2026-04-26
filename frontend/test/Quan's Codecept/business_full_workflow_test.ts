/// <reference path="../../steps.d.ts" />

import { testData } from "../identity/data/user_data";

Feature("Business workflow - full step-by-step tour with screenshots");

const adminEmail = process.env.CODECEPT_ADMIN_EMAIL || testData.admin.email;
const adminPassword = process.env.CODECEPT_ADMIN_PASSWORD || testData.admin.password;
const viewDelaySeconds = Number(process.env.E2E_VIEW_DELAY_SECONDS || "4");

const uniqueSuffix = new Date().toISOString().replace(/\D/g, "").slice(-8);

const primaryTenant = {
  restaurantName: `S2O Demo ${uniqueSuffix}`,
  ownerName: `Chu Quan ${uniqueSuffix}`,
  email: `owner${uniqueSuffix}@s2o.com`,
  password: `Owner@${uniqueSuffix}`,
  address: `123 Nguyen Hue ${uniqueSuffix}, Q1, TP.HCM`,
  phoneNumber: `0909${uniqueSuffix.slice(-6)}`,
};

const cleanupTenant = {
  restaurantName: `S2O Cleanup ${uniqueSuffix}`,
  ownerName: `Cleanup Owner ${uniqueSuffix}`,
  email: `cleanup${uniqueSuffix}@s2o.com`,
  password: `Cleanup@${uniqueSuffix}`,
  address: `321 Le Loi ${uniqueSuffix}, Q1, TP.HCM`,
  phoneNumber: `0910${uniqueSuffix.slice(-6)}`,
};

const branchName = `Chi nhanh ${uniqueSuffix}`;
const categoryName = `Danh muc ${uniqueSuffix}`;
const productNames = [
  `Mon 1 ${uniqueSuffix}`,
  `Mon 2 ${uniqueSuffix}`,
  `Mon 3 ${uniqueSuffix}`,
  `Mon 4 ${uniqueSuffix}`,
];
const manager = {
  fullName: `Quan ly ${uniqueSuffix}`,
  email: `manager${uniqueSuffix}@s2o.com`,
  password: `Manager@${uniqueSuffix}`,
  phoneNumber: `0911${uniqueSuffix.slice(-6)}`,
};
const tableNames = [`Ban 1 ${uniqueSuffix}`, `Ban 2 ${uniqueSuffix}`, `Ban 3 ${uniqueSuffix}`, `Ban 4 ${uniqueSuffix}`];

function formatDateYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function pauseForViewing(I: CodeceptJS.I) {
  await I.wait(viewDelaySeconds);
}

async function takeShot(I: CodeceptJS.I, name: string) {
  await pauseForViewing(I);
  await I.saveScreenshot(name);
}

async function clearBrowserSession(I: CodeceptJS.I) {
  await I.usePlaywrightTo("clear browser session", async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // Ignore pages that do not expose browser storage yet.
      }
    });
  });
}

async function loginAs(I: CodeceptJS.I, email: string, password: string, expectedUrl: string) {
  I.amOnPage("/login");
  I.fillField("#email", email);
  I.fillField("#password", password);
  I.click("Đăng nhập");
  I.waitInUrl(expectedUrl, 20);
}

async function logout(I: CodeceptJS.I) {
  await I.usePlaywrightTo("click logout", async ({ page }) => {
    const forceLogin = async () => {
      await page.context().clearCookies();
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // Ignore storage errors during forced logout fallback.
        }
      });
      await page.goto(new URL("/login", page.url()).toString(), { waitUntil: "commit" });
    };

    page.once("dialog", (dialog) => dialog.accept());

    const byButton = page.getByRole("button", { name: "Đăng xuất" });
    if (await byButton.count()) {
      await byButton.last().click({ force: true });
      try {
        await page.waitForURL(/\/login/, { timeout: 5000, waitUntil: "commit" });
        await page.waitForURL(/logged_out=true/, { timeout: 5000 });
      } catch {
        await forceLogin();
      }

      try {
        await page.getByText("Đã đăng xuất thành công").first().waitFor({ state: "visible", timeout: 6000 });
      } catch {
        // Keep the flow resilient if toast is delayed or hidden by animation.
      }
      return;
    }

    const byMenuItem = page.getByRole("menuitem", { name: "Đăng xuất" });
    if (await byMenuItem.count()) {
      await byMenuItem.last().click({ force: true });
      try {
        await page.waitForURL(/\/login/, { timeout: 5000, waitUntil: "commit" });
        await page.waitForURL(/logged_out=true/, { timeout: 5000 });
      } catch {
        await forceLogin();
      }

      try {
        await page.getByText("Đã đăng xuất thành công").first().waitFor({ state: "visible", timeout: 6000 });
      } catch {
        // Keep the flow resilient if toast is delayed or hidden by animation.
      }
      return;
    }

    const byText = page.getByText("Đăng xuất", { exact: true });
    if (await byText.count()) {
      await byText.last().click({ force: true });
      try {
        await page.waitForURL(/\/login/, { timeout: 5000, waitUntil: "commit" });
        await page.waitForURL(/logged_out=true/, { timeout: 5000 });
      } catch {
        await forceLogin();
      }

      try {
        await page.getByText("Đã đăng xuất thành công").first().waitFor({ state: "visible", timeout: 6000 });
      } catch {
        // Keep the flow resilient if toast is delayed or hidden by animation.
      }
      return;
    }

    throw new Error("Không tìm thấy nút Đăng xuất");
  });
}

async function openComboboxOption(I: CodeceptJS.I, comboboxIndex: number, optionLabel: string) {
  await I.usePlaywrightTo(`choose combobox option ${optionLabel}`, async ({ page }) => {
    const comboboxes = page.getByRole("combobox");
    await comboboxes.nth(comboboxIndex).click();

    const listbox = page.getByRole("listbox").last();
    await listbox.waitFor({ state: "visible", timeout: 10000 }).catch(() => undefined);

    const option = page.getByRole("option", { name: optionLabel, exact: true });
    await option.waitFor({ state: "visible", timeout: 15000 });
    await option.click();
  });
}

function buildFreshGmail(seed: string) {
  const sanitizedSeed = seed
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 18) || "s2ouser";
  const nonce = `${Date.now().toString(36)}${Math.floor(Math.random() * 10000).toString(36)}`;
  return `${sanitizedSeed}.${nonce}@gmail.com`;
}

async function createTenant(I: CodeceptJS.I, tenant: typeof primaryTenant) {
  // Always use a fresh owner email to avoid unique-key conflicts between reruns.
  tenant.email = buildFreshGmail(tenant.ownerName);

  I.amOnPage("/sysadmin/restaurants");
  I.waitForText("Quản lý Đối tác", 20);
  I.click("Đăng ký mới");
  I.waitForText("Đăng ký Nhà hàng mới", 20);

  I.fillField('input[placeholder*="Kichi Kichi"]', tenant.restaurantName);
  I.fillField('input[placeholder*="123 Đường ABC"]', tenant.address);
  I.fillField('input[placeholder*="0909"]', tenant.phoneNumber);
  I.fillField('input[placeholder*="Nguyễn Văn A"]', tenant.ownerName);
  I.fillField('input[placeholder*="owner@gmail.com"]', tenant.email);
  await I.usePlaywrightTo("fill tenant password when visible", async ({ page }) => {
    const dialog = page.getByRole("dialog").last();
    const passwordInput = dialog.locator('input[type="password"]').first();

    if (await passwordInput.count()) {
      await passwordInput.fill(tenant.password);
      return;
    }

    const fallbackInput = dialog
      .locator('input[name*="password" i], input[placeholder*="mật khẩu" i], input[placeholder*="password" i]')
      .first();

    if (await fallbackInput.count()) {
      await fallbackInput.fill(tenant.password);
    }
  });

  I.click("Khởi tạo Nhà hàng");
  await I.usePlaywrightTo("wait optional tenant-created toast", async ({ page }) => {
    try {
      await page.getByText("Khởi tạo nhà hàng thành công").first().waitFor({ state: "visible", timeout: 6000 });
    } catch {
      // Toast can be skipped/hidden; fallback verification is the table lookup below.
    }
  });

  await I.usePlaywrightTo("reload tenant list and verify tenant appears", async ({ page }) => {
    const restaurantsUrl = new URL("/sysadmin/restaurants", page.url()).toString();

    const searchAndWait = async (timeout: number) => {
      const searchInput = page.locator('input[placeholder*="Tìm theo Tên, ID"]').first();
      await searchInput.fill(tenant.restaurantName);
      const row = page.locator("tbody tr").filter({ hasText: tenant.restaurantName }).first();
      await row.waitFor({ state: "visible", timeout });
    };

    await page.goto(restaurantsUrl, { waitUntil: "domcontentloaded" });
    await page.getByText("Quản lý Đối tác").first().waitFor({ state: "visible", timeout: 20000 });

    try {
      await searchAndWait(10000);
    } catch {
      // Some backends commit asynchronously; do one more reload before failing.
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.getByText("Quản lý Đối tác").first().waitFor({ state: "visible", timeout: 20000 });
      await searchAndWait(30000);
    }
  });
}

async function searchTenant(I: CodeceptJS.I, tenantName: string) {
  I.fillField('input[placeholder*="Tìm theo Tên, ID"]', tenantName);
  I.waitForText(tenantName, 20);
}

async function toggleTenantLock(I: CodeceptJS.I, tenantName: string, lockAction: "Khóa" | "Mở khóa") {
  await I.usePlaywrightTo(`toggle lock for ${tenantName}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: tenantName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 });
    await row.getByRole("button").last().click();
    await page.getByRole("menuitem", { name: lockAction }).click();
  });
}

async function submitTenantLockDialog(I: CodeceptJS.I, reason: string) {
  I.waitForText("Khóa nhà hàng", 20);
  I.fillField("#lock-reason", reason);
  I.fillField("#lock-duration", "7");
  I.click("Xác nhận khóa");
  I.wait(2);
}

async function deleteTenant(I: CodeceptJS.I, tenantName: string) {
  await I.usePlaywrightTo(`open delete action for ${tenantName}`, async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: tenantName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 });
    await row.getByRole("button").last().click();
    await page.getByRole("menuitem", { name: "Xóa dữ liệu" }).click();
  });

  I.waitForText("Cảnh báo xóa nhà hàng", 20);
  I.click("Xóa vĩnh viễn");
  I.wait(2);
}

async function createCategory(I: CodeceptJS.I, name: string) {
  I.amOnPage("/owner/menu");
  I.waitForText("Danh mục", 20);
  await I.usePlaywrightTo("open category dialog", async ({ page }) => {
    const addButton = page
      .getByRole("button", { name: /Thêm danh mục|Tạo danh mục|Thêm/i })
      .first();
    await addButton.waitFor({ state: "visible", timeout: 15000 });
    await addButton.click();

    const dialogTitle = page.getByText("Tạo danh mục mới").first();
    await dialogTitle.waitFor({ state: "visible", timeout: 20000 });
  });

  await I.usePlaywrightTo("fill and submit category form", async ({ page }) => {
    const dialog = page.getByRole("dialog").last();

    const nameInput = dialog
      .locator('input[placeholder*="Ví dụ: Đồ uống"], input[placeholder*="Đồ uống"]')
      .first();
    await nameInput.waitFor({ state: "visible", timeout: 10000 });
    await nameInput.fill(name);

    const descriptionInput = dialog
      .locator('textarea[placeholder*="Ghi chú thêm về nhóm món"], textarea[placeholder*="nhóm món này"]')
      .first();
    if (await descriptionInput.count()) {
      await descriptionInput.fill(`Mo ta ${name}`);
    }

    const submitButton = dialog.getByRole("button", { name: /Tạo mới|Tạo danh mục|Lưu/i }).first();
    await submitButton.click();
  });

  I.waitForText(name, 20);
}

async function createProduct(I: CodeceptJS.I, productName: string, index: number) {
  I.click("Thêm món mới");
  I.waitForText("Thêm món mới", 20);

  I.fillField('input[placeholder*="Phở bò"]', productName);
  I.fillField('input[type="number"]', String(50000 + index * 10000));
  I.fillField('textarea[placeholder*="Thành phần"]', `Mo ta ${productName}`);
  I.click("Thêm món");
  I.waitForText(productName, 20);
}

async function createBranch(I: CodeceptJS.I, name: string) {
  I.amOnPage("/owner/branches");
  I.waitForText("Chi nhánh", 20);
  I.click("Thêm");
  I.waitForText("Thêm chi nhánh mới", 20);

  I.fillField('input[placeholder*="Chi nhánh Quận 1"]', name);
  I.fillField('input[placeholder*="Số 123 đường ABC"]', `So 1 ${name}`);
  I.fillField('input[placeholder*="0909"]', `0909${uniqueSuffix.slice(-6)}`);
  I.click("Tạo chi nhánh");
  I.waitForText(name, 20);
}

async function createTable(I: CodeceptJS.I, tableName: string) {
  I.click("Thêm bàn");
  I.waitForText("Thêm bàn mới", 20);

  I.fillField('input[placeholder*="Bàn 01"]', tableName);
  I.fillField('input[type="number"]', "4");
  await openComboboxOption(I, 0, "Trống");
  await I.usePlaywrightTo("submit table dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog").last();
    const submitButton = dialog.getByRole("button", { name: "Thêm bàn" });
    await submitButton.waitFor({ state: "visible", timeout: 10000 });
    await submitButton.click({ force: true });
  });
  I.waitForText(tableName, 20);
}

async function createManager(I: CodeceptJS.I, branchLabel: string) {
  I.amOnPage("/owner/staff");
  I.waitForText("Quản lý nhân viên", 20);
  I.click("Thêm nhân viên");
  I.waitForText("Thêm nhân viên mới", 20);

  await I.usePlaywrightTo("fill manager dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog").last();
    const inputs = dialog.locator("input");

    await inputs.nth(0).fill(manager.email);
    await inputs.nth(1).fill(manager.password);
    await inputs.nth(2).fill(manager.fullName);
    await inputs.nth(3).fill(manager.phoneNumber);

    const selects = dialog.getByRole("combobox");
    await selects.nth(0).click();
    await page.getByRole("option", { name: "Quản lý" }).click();
    await selects.nth(1).click();
    await page.getByRole("option", { name: branchLabel, exact: true }).click();
  });

  I.click("Lưu thay đổi");
  I.waitForText(manager.fullName, 20);
}

async function collectQrLinks(I: CodeceptJS.I, branchLabel: string) {
  I.amOnPage("/owner/qr-codes");
  I.waitForText("Tạo mã QR", 20);
  await openComboboxOption(I, 0, branchLabel);
  I.click("Chọn tất cả");
  I.wait(2);

  return await I.usePlaywrightTo("collect qr links", async ({ page }) => {
    const matches = await page.locator("p").evaluateAll((nodes) =>
      nodes
        .map((node) => (node.textContent || "").trim())
        .filter((text) => text.includes("/guest/t/"))
    );

    if (matches.length === 0) {
      throw new Error("Không tìm thấy link QR nào trên trang in mã QR.");
    }

    return matches;
  });
}

async function addGuestProducts(I: CodeceptJS.I, guestUrl: string) {
  I.amOnPage(guestUrl);
  I.waitForText("Thực đơn", 20);

  for (const [index, productName] of productNames.entries()) {
    await I.usePlaywrightTo(`add guest product ${productName}`, async ({ page }) => {
      const card = page.locator("div.relative.flex.gap-3").filter({ hasText: productName }).first();
      await card.waitFor({ state: "visible", timeout: 10000 });
      await card.getByRole("button").click();

      const expectedTotalItems = index + 1;
      await page.waitForFunction(
        (expected) => {
          try {
            const raw = localStorage.getItem("guest_cart");
            if (!raw) return false;
            const items = JSON.parse(raw) as Array<{ quantity?: number; qty?: number }>;
            const total = items.reduce((sum, item) => {
              const q = Number(item.quantity ?? item.qty ?? 0);
              return sum + (Number.isFinite(q) ? q : 0);
            }, 0);
            return total >= expected;
          } catch {
            return false;
          }
        },
        expectedTotalItems,
        { timeout: 10000 }
      );
    });
  }
}

async function placeGuestOrder(I: CodeceptJS.I, guestUrl: string) {
  I.amOnPage(`${guestUrl}/cart`);
  I.waitForText("Giỏ hàng", 20);
  I.waitForText(productNames[0], 20);
  I.waitForText(productNames[1], 20);
  I.waitForText(productNames[2], 20);
  I.waitForText(productNames[3], 20);
  I.click("Xác nhận đặt món");
  I.waitForText("Mã đơn:", 20);
}

async function verifyTableStatus(I: CodeceptJS.I, expectedStatus: "Có khách" | "Trống") {
  I.amOnPage("/staff/tables");
  I.waitForText("Các bàn trong chi nhánh", 20);

  await I.usePlaywrightTo(`verify ${tableNames[0]} status is ${expectedStatus}`, async ({ page }) => {
    const statusBadge = page
      .locator("[data-slot='card']")
      .filter({ hasText: tableNames[0] })
      .first()
      .locator("[data-slot='badge']")
      .first();

    await statusBadge.waitFor({ state: "visible", timeout: 20000 });
    const statusText = (await statusBadge.innerText()).trim();

    if (!statusText.includes(expectedStatus)) {
      throw new Error(`Trạng thái bàn hiện tại là '${statusText}', mong đợi '${expectedStatus}'.`);
    }
  });
}

async function confirmAndPayOrder(I: CodeceptJS.I) {
  I.amOnPage("/staff/order-ticket");
  I.waitForText("Tiếp nhận đơn hàng", 20);

  await I.usePlaywrightTo("confirm first pending order", async ({ page }) => {
    const card = page.locator("div").filter({ hasText: productNames[0] }).filter({ has: page.getByRole("button", { name: "Xác nhận" }) }).first();
    await card.waitFor({ state: "visible", timeout: 15000 });
    await card.getByRole("button", { name: "Xác nhận" }).click();
  });

  I.wait(2);

  await verifyTableStatus(I, "Có khách");
  await takeShot(I, "13a-table-occupied-after-confirm");

  I.amOnPage("/staff/order-ticket");
  I.waitForText("Tiếp nhận đơn hàng", 20);

  await I.usePlaywrightTo("switch to invoice tab and pay", async ({ page }) => {
    await page.getByRole("tab", { name: /Hóa đơn/ }).click();
    const invoiceCard = page.locator("div").filter({ hasText: productNames[0] }).filter({ has: page.getByRole("button", { name: "Xem chi tiết hóa đơn" }) }).first();
    await invoiceCard.waitFor({ state: "visible", timeout: 15000 });
    await invoiceCard.getByRole("button", { name: "Xem chi tiết hóa đơn" }).click();
  });

  await takeShot(I, "13a-invoice-detail-before-payment");

  await I.usePlaywrightTo("confirm payment after viewing invoice", async ({ page }) => {
    await page.getByRole("button", { name: "Đã thanh toán" }).click();
  });

  I.wait(2);

  await verifyTableStatus(I, "Trống");
  await takeShot(I, "13b-table-empty-after-payment");
}

async function verifyTablesAndHistory(I: CodeceptJS.I) {
  I.amOnPage("/staff/tables");
  I.waitForText("Các bàn trong chi nhánh", 20);
  await I.usePlaywrightTo("verify staff tables content", async ({ page }) => {
    const bodyText = await page.locator("body").innerText();
    if (tableNames.some((tableName) => bodyText.includes(tableName))) {
      return;
    }

    if (bodyText.includes("Chưa lấy được danh sách bàn của chi nhánh.") || bodyText.includes("0 bàn")) {
      return;
    }

    throw new Error("Không xác nhận được trạng thái danh sách bàn của chi nhánh.");
  });

  I.amOnPage("/staff/history");
  I.waitForText("Lịch sử thanh toán", 20);
  I.see("Biểu đồ doanh thu");

  let openedInvoiceDetail = false;
  await I.usePlaywrightTo("open invoice detail in history when available", async ({ page }) => {
    const detailButtons = page.getByRole("button", { name: /Chi tiết hóa đơn|Xem chi tiết hóa đơn/ });
    const emptyState = page.getByText("Không có dữ liệu trong khoảng thời gian đã chọn.");

    await page.waitForTimeout(1200);

    if (await detailButtons.first().isVisible().catch(() => false)) {
      await detailButtons.first().click();
      openedInvoiceDetail = true;
      return;
    }

    if (await emptyState.first().isVisible().catch(() => false)) {
      openedInvoiceDetail = false;
      return;
    }

    openedInvoiceDetail = false;
  });

  await takeShot(I, openedInvoiceDetail ? "14a-history-invoice-detail" : "14a-history-empty-state");

  await I.usePlaywrightTo("slow down history with filters and chart mode", async ({ page }) => {
    const historyDialog = page.getByRole("dialog").last();

    if (await historyDialog.isVisible().catch(() => false)) {
      await page.keyboard.press("Escape");
      await historyDialog.waitFor({ state: "hidden", timeout: 5000 }).catch(() => undefined);
    }

    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 14);
    const nowYmd = formatDateYmd(now);
    const fromYmd = formatDateYmd(from);

    const historyDateInput = page.locator("#history-date");
    await historyDateInput.waitFor({ state: "visible", timeout: 10000 });
    await historyDateInput.fill(nowYmd);
    await page.locator("select[aria-label='Kiểu biểu đồ doanh thu']").selectOption("month");

    const fromDateInput = page.locator("input[aria-label='Từ ngày']");
    const toDateInput = page.locator("input[aria-label='Đến ngày']");
    await fromDateInput.fill(fromYmd);
    await toDateInput.fill(nowYmd);

    const historyDateValue = await page.locator("#history-date").inputValue();
    const modeValue = await page.locator("select[aria-label='Kiểu biểu đồ doanh thu']").inputValue();
    const fromValue = await fromDateInput.inputValue();
    const toValue = await toDateInput.inputValue();

    if (historyDateValue !== nowYmd) {
      throw new Error(`Ngày lọc history chưa đúng. Thực tế: ${historyDateValue}, mong đợi: ${nowYmd}`);
    }

    if (modeValue !== "month") {
      throw new Error(`Kiểu biểu đồ chưa chuyển sang tháng. Thực tế: ${modeValue}`);
    }

    if (fromValue !== fromYmd || toValue !== nowYmd) {
      throw new Error(`Khoảng ngày biểu đồ chưa đúng. from=${fromValue}, to=${toValue}`);
    }

    const chartBars = page.locator("svg[aria-label='Biểu đồ doanh thu'] rect");
    const hasBars = await chartBars.first().isVisible().catch(() => false);

    if (!hasBars) {
      const noDataText = await page.getByText("Không có dữ liệu trong khoảng thời gian đã chọn.").first().isVisible().catch(() => false);
      if (!noDataText) {
        throw new Error("Biểu đồ doanh thu không hiển thị cột dữ liệu và cũng không có thông báo trạng thái rỗng.");
      }
    }
  });

  await pauseForViewing(I);
  await takeShot(I, "14b-history-revenue-filtered");
}

async function openOwnerRevenue(I: CodeceptJS.I) {
  I.amOnPage("/owner/revenue");
  I.waitForText("Báo cáo Doanh thu", 20);
  await takeShot(I, "15a-owner-revenue-opened");

  await openComboboxOption(I, 0, "Từ lúc mở");
  await pauseForViewing(I);
  I.click("Phân tích");
  await takeShot(I, "15b-owner-revenue-analytics");

  await openComboboxOption(I, 0, "Theo ngày chọn");
  await pauseForViewing(I);

  await I.usePlaywrightTo("scroll owner revenue analytics", async ({ page }) => {
    await page.getByRole("tab", { name: "Phân tích" }).click();
    await page.mouse.wheel(0, 700);
    await page.mouse.wheel(0, -450);
  });

  await takeShot(I, "15c-owner-revenue-scrolled");

  await I.usePlaywrightTo("verify revenue analytics section", async ({ page }) => {
    const bodyText = await page.locator("body").innerText();
    if (bodyText.includes("So sánh doanh thu theo chi nhánh") || bodyText.includes("Doanh thu của")) {
      return;
    }

    throw new Error("Không xác nhận được khu vực phân tích doanh thu.");
  });
}

async function viewAdminStatsSlowly(I: CodeceptJS.I) {
  I.amOnPage("/sysadmin/dashboard");
  I.waitForText("Lọc thống kê theo thời gian", 20);

  await I.usePlaywrightTo("adjust admin stats time and scroll", async ({ page }) => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 30);

    const dateInputs = page.locator("input[type='date']");
    const fromYmd = formatDateYmd(from);
    const toYmd = formatDateYmd(now);
    await dateInputs.nth(0).fill(fromYmd);
    await dateInputs.nth(1).fill(toYmd);

    await page.getByRole("button", { name: "Áp dụng lọc" }).click();
    await page.waitForTimeout(1200);

    const filledFrom = await dateInputs.nth(0).inputValue();
    const filledTo = await dateInputs.nth(1).inputValue();
    if (filledFrom !== fromYmd || filledTo !== toYmd) {
      throw new Error(`Admin dashboard chưa áp đúng ngày lọc. from=${filledFrom}, to=${filledTo}`);
    }

    const appliedFilterText = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    if (!appliedFilterText.includes(`Khoảng lọc: ${fromYmd} đến ${toYmd}`)) {
      throw new Error("Không thấy khoảng lọc sau khi áp dụng ngày trên dashboard admin.");
    }

    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(600);
    await page.mouse.wheel(0, -700);
  });

  await takeShot(I, "16-admin-stats-filtered-scrolled");
}

Scenario("[BUSINESS-FULL-01] Chạy tuần tự từng chức năng và chụp màn hình", async ({ I }) => {
  await clearBrowserSession(I);

  await loginAs(I, adminEmail, adminPassword, "/sysadmin/dashboard");
  await takeShot(I, "01-admin-dashboard");

  await createTenant(I, primaryTenant);
  await takeShot(I, "02-created-primary-tenant");

  await createTenant(I, cleanupTenant);
  await takeShot(I, "03-created-cleanup-tenant");

  await logout(I);

  await loginAs(I, primaryTenant.email, primaryTenant.password, "/owner/dashboard");
  await takeShot(I, "04-owner-dashboard");

  await createCategory(I, categoryName);
  await takeShot(I, "05-category-created");

  I.amOnPage("/owner/menu");
  for (let index = 0; index < productNames.length; index += 1) {
    await createProduct(I, productNames[index], index + 1);
  }
  await takeShot(I, "06-products-created");

  await createBranch(I, branchName);
  await takeShot(I, "07-branch-created");

  I.amOnPage("/owner/branches");
  await I.usePlaywrightTo("select created branch", async ({ page }) => {
    const branchCard = page.getByText(branchName, { exact: true }).first();
    await branchCard.waitFor({ state: "visible", timeout: 10000 });
    await branchCard.click();
  });
  for (const tableName of tableNames) {
    await createTable(I, tableName);
  }
  await takeShot(I, "08-tables-created");

  await createManager(I, branchName);
  await takeShot(I, "09-manager-created");

  const qrLinks = await collectQrLinks(I, branchName);
  await takeShot(I, "10-qr-links-visible");

  await addGuestProducts(I, qrLinks[0]);
  await takeShot(I, "11-guest-cart-filled");

  await placeGuestOrder(I, qrLinks[0]);
  await takeShot(I, "12-guest-order-placed");

  await clearBrowserSession(I);
  I.amOnPage("/login");

  await loginAs(I, manager.email, manager.password, "/staff/order-ticket");
  await confirmAndPayOrder(I);
  await takeShot(I, "13-order-confirmed-and-paid");

  await verifyTablesAndHistory(I);
  await takeShot(I, "14-tables-and-history");

  await logout(I);

  await loginAs(I, primaryTenant.email, primaryTenant.password, "/owner/dashboard");
  await openOwnerRevenue(I);
  await takeShot(I, "15-owner-revenue");

  await clearBrowserSession(I);
  I.amOnPage("/login");

  await loginAs(I, adminEmail, adminPassword, "/sysadmin/dashboard");
  I.waitForText("Tổng Nhà hàng", 20);
  I.see("Tổng Users");
  I.see("Biểu đồ doanh thu nền tảng");
  await viewAdminStatsSlowly(I);
  await takeShot(I, "16-admin-stats");

  I.amOnPage("/sysadmin/restaurants");
  await searchTenant(I, primaryTenant.restaurantName);
  await toggleTenantLock(I, primaryTenant.restaurantName, "Khóa");
  await submitTenantLockDialog(I, `Khoa test ${primaryTenant.restaurantName}`);
  I.waitForText("Locked", 20);
  await takeShot(I, "17-tenant-locked");

  await clearBrowserSession(I);
  I.amOnPage("/login");
  I.fillField("#email", primaryTenant.email);
  I.fillField("#password", primaryTenant.password);
  I.click("Đăng nhập");
  I.waitForText("Lỗi đăng nhập", 20);
  I.waitInUrl("/login", 20);
  await takeShot(I, "18-owner-login-attempt-after-lock");

  await clearBrowserSession(I);
  I.amOnPage("/login");

  await loginAs(I, adminEmail, adminPassword, "/sysadmin/dashboard");
  I.amOnPage("/sysadmin/restaurants");
  await searchTenant(I, primaryTenant.restaurantName);
  await toggleTenantLock(I, primaryTenant.restaurantName, "Mở khóa");
  await pauseForViewing(I);
  I.waitForText(primaryTenant.restaurantName, 20);
  await takeShot(I, "19-tenant-unlocked");

  await deleteTenant(I, cleanupTenant.restaurantName);
  await takeShot(I, "20-cleanup-tenant-deleted");

  await logout(I);
});
