/// <reference path="../../steps.d.ts" />

import { testData } from "../identity/data/user_data";

Feature("Thống kê hệ thống - Admin");

const adminEmail = process.env.CODECEPT_ADMIN_EMAIL || testData.admin.email;
const adminPassword = process.env.CODECEPT_ADMIN_PASSWORD || testData.admin.password;
const ownerEmail = process.env.CODECEPT_OWNER_EMAIL || testData.owner.email;
const ownerPassword = process.env.CODECEPT_OWNER_PASSWORD || testData.owner.password;

function loginWithRole(I: CodeceptJS.I, loginPage: any, email: string, password: string) {
  I.amOnPage("/login");
  loginPage.sendForm(email, password);
}

function loginAsAdmin(I: CodeceptJS.I, loginPage: any) {
  loginWithRole(I, loginPage, adminEmail, adminPassword);
  I.waitInUrl("/sysadmin/dashboard", 10);
}

function fillDateRange(I: CodeceptJS.I, fromDate: string, toDate: string) {
  I.usePlaywrightTo("fill admin stats date range", async ({ page }) => {
    const dateInputs = page.locator("input[type='date']");

    await dateInputs.nth(0).fill(fromDate);
    await dateInputs.nth(1).fill(toDate);
  });
}

function formatDateYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

Scenario("[ITC_3.1] Admin xem thống kê khi hệ thống có dữ liệu", ({ I, loginPage }) => {
  loginAsAdmin(I, loginPage);
  I.waitForText("Lọc thống kê theo thời gian", 10);

  I.see("Tổng Nhà hàng");
  I.see("Tổng Users");
  I.see("Doanh thu (Platform lũy kế)");
  I.see("Biểu đồ doanh thu nền tảng");

  I.usePlaywrightTo("verify dashboard cards and chart are visible", async ({ page }) => {
    const metricCards = ["Tổng Nhà hàng", "Tổng Users", "Doanh thu (Platform lũy kế)"];

    for (const cardTitle of metricCards) {
      const card = page.locator("[data-slot='card']").filter({ hasText: cardTitle }).first();
      await card.waitFor({ state: "visible", timeout: 5000 });
    }

    const hasChart = (await page.locator(".recharts-wrapper").count()) > 0;
    const hasNoDataMessage =
      (await page.getByText("Chưa có dữ liệu doanh thu theo thời gian.").count()) > 0;

    if (!hasChart && !hasNoDataMessage) {
      throw new Error("Không tìm thấy biểu đồ hoặc trạng thái dữ liệu doanh thu.");
    }
  });
});

Scenario("[ITC_3.2] Admin xem thống kê khi hệ thống chưa có dữ liệu", ({ I, loginPage }) => {
  loginAsAdmin(I, loginPage);

  const noDataFrom = "2099-01-01";
  const noDataTo = "2099-01-07";

  fillDateRange(I, noDataFrom, noDataTo);
  I.click("Áp dụng lọc");

  I.waitInUrl("/sysadmin/dashboard", 10);
  I.see(`Khoảng lọc: ${noDataFrom} đến ${noDataTo}`);

  I.usePlaywrightTo("verify no-data state does not break UI", async ({ page }) => {
    const noDataText = page.getByText("Chưa có dữ liệu doanh thu theo thời gian.");
    const hasNoDataText = (await noDataText.count()) > 0;

    const cardValues = await page
      .locator("[data-slot='card'] .text-2xl.font-bold")
      .allTextContents();
    const hasZeroValue = cardValues.some((text) => {
      const numeric = Number(text.replace(/[^0-9]/g, "") || "0");
      return numeric === 0;
    });

    if (!hasNoDataText && !hasZeroValue) {
      throw new Error("Không thấy trạng thái no-data hoặc chỉ số 0 khi lọc khoảng không có dữ liệu.");
    }
  });
});

Scenario("[ITC_3.3] Người dùng không phải Admin truy cập thống kê", async ({ I, loginPage }) => {
  loginWithRole(I, loginPage, ownerEmail, ownerPassword);
  I.waitInUrl("/owner/dashboard", 10);

  I.amOnPage("/sysadmin/dashboard");
  I.wait(1);

  const currentUrl = await I.grabCurrentUrl();
  if (currentUrl.includes("/sysadmin/dashboard")) {
    throw new Error("Tài khoản không phải admin vẫn truy cập được /sysadmin/dashboard.");
  }

  I.usePlaywrightTo("verify unauthorized user is redirected", async ({ page }) => {
    const url = page.url();
    const isRedirected =
      url.includes("/login") || url.includes("/owner/") || url.includes("/staff/") || url.endsWith("/");

    if (!isRedirected) {
      throw new Error(`Điều hướng không mong đợi cho non-admin: ${url}`);
    }
  });
});

Scenario("[ITC_3.4] Chưa đăng nhập truy cập thống kê", ({ I }) => {
  I.amOnPage("/login");
  I.clearCookie();

  I.usePlaywrightTo("clear auth state", async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    });
  });

  I.amOnPage("/sysadmin/dashboard");
  I.waitForText("S2O Restaurant", 5);
  I.seeInCurrentUrl("/login");
});

Scenario("[ITC_3.5] Admin lọc thống kê theo khoảng thời gian hợp lệ", ({ I, loginPage }) => {
  loginAsAdmin(I, loginPage);

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 6);

  const fromYmd = formatDateYmd(fromDate);
  const toYmd = formatDateYmd(toDate);

  fillDateRange(I, fromYmd, toYmd);
  I.click("Áp dụng lọc");

  I.waitInUrl("/sysadmin/dashboard", 10);
  I.see(`Khoảng lọc: ${fromYmd} đến ${toYmd}`);
  I.see("Biểu đồ doanh thu nền tảng");
  I.see("Tổng Nhà hàng");
});

Scenario("[ITC_3.6] Admin chọn khoảng thời gian không hợp lệ", ({ I, loginPage }) => {
  loginAsAdmin(I, loginPage);

  fillDateRange(I, "2026-04-19", "2026-04-10");
  I.click("Áp dụng lọc");

  I.see("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
  I.see("Khoảng lọc: --/--/---- đến --/--/----");
});
