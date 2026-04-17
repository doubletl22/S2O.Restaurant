/// <reference path="../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "./identity/data/user_data";

const suffix = randomUUID().slice(0, 8);
const searchInputSelector = '[placeholder="Tìm theo Tên, ID... (VD: pizza, phở, 12345678)"]';

const lockDraft = {
  restaurantName: `ITC6 Lock ${suffix}`,
  ownerName: `ITC6 Owner ${suffix}`,
  email: `itc6_owner_${suffix}@s2o.test`,
  password: "Quan11209",
  address: `123 ITC6 Street ${suffix}`,
  phoneNumber: "0909123456",
};

let tenantId = "";

function goToRestaurants(I: CodeceptJS.I) {
  I.amOnPage("/sysadmin/restaurants");
  I.waitInUrl("/sysadmin/restaurants", 10);
  I.waitForElement("table", 10);
}

async function waitForAccessToken(I: CodeceptJS.I, timeoutMs = 12000) {
  return I.usePlaywrightTo("wait for access token", async ({ page }) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const token = await page.evaluate(() => localStorage.getItem("accessToken") || "");
      if (token) return true;
      await page.waitForTimeout(300);
    }

    return false;
  });
}

async function loginWithRetry(
  I: CodeceptJS.I,
  loginPage: any,
  email: string,
  password: string,
  maxAttempts = 2
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    I.amOnPage("/login");
    loginPage.sendForm(email, password);

    let loggedIn = false;
    try {
      loggedIn = await waitForAccessToken(I);
    } catch {
      loggedIn = false;
    }

    if (loggedIn) return;

    if (attempt === maxAttempts) {
      throw new Error(`Login failed for ${email} after retry`);
    }
  }
}

async function loginAsAdmin(I: CodeceptJS.I, loginPage: any) {
  await loginWithRetry(I, loginPage, testData.admin.email, testData.admin.password);
}

async function loginAsOwner(I: CodeceptJS.I, loginPage: any, email: string, password: string) {
  await loginWithRetry(I, loginPage, email, password);
}

async function clearClientSession(I: CodeceptJS.I) {
  I.amOnPage("/login");
  I.clearCookie();

  await I.usePlaywrightTo("clear auth session", async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      } catch {
        // Ignore storage cleanup when document is not same-origin.
      }
    });
  });
}

async function captureTenantIdFromRow(I: CodeceptJS.I, restaurantName: string) {
  const id = await I.usePlaywrightTo("capture tenant id from row", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: restaurantName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 });

    const text = await row.textContent();
    const match = text?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match?.[0] ?? "";
  });

  if (!id) {
    throw new Error("Cannot capture tenant id from restaurants table row");
  }

  tenantId = id;
}

async function ensureTenantActive(I: CodeceptJS.I, restaurantName: string) {
  const isLocked = await I.usePlaywrightTo("check tenant locked badge", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: restaurantName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 });
    return (await row.getByText("Locked").count()) > 0;
  });

  if (isLocked) {
    I.clickTableRowActionAndAcceptPopup(restaurantName, 0);
    I.waitForTableRowStatus(restaurantName, "Active");
  }
}

function openLockDialog(I: CodeceptJS.I, restaurantName: string) {
  I.clickTableRowAction(restaurantName, 0);
  I.waitForElement("#lock-reason", 10);
  I.waitForElement("#lock-duration", 10);
}

Feature("ITC_6 - Khóa nhà hàng");

Scenario("ITC_6.SETUP - Tạo nhà hàng dữ liệu test", async ({ I, loginPage }) => {
  await clearClientSession(I);
  await loginAsAdmin(I, loginPage);

  goToRestaurants(I);
  I.click("Đăng ký mới");
  I.waitForElement('[role="dialog"]', 15);
  I.waitForElement('input[placeholder="Kichi Kichi..."]', 10);
  I.fillTenantRegistrationDialog(lockDraft);
  I.click("Khởi tạo Nhà hàng");
  I.waitForDialogToClose();

  I.fillField(searchInputSelector, lockDraft.restaurantName);
  I.waitForTableRow(lockDraft.restaurantName);

  await captureTenantIdFromRow(I, lockDraft.restaurantName);
});

Scenario("ITC_6.3 - Non-admin truy cập chức năng khóa bị từ chối", async ({ I, loginPage }) => {
  await clearClientSession(I);

  await loginWithRetry(I, loginPage, lockDraft.email, lockDraft.password, 3);

  I.amOnPage("/sysadmin/restaurants");

  await I.usePlaywrightTo("assert denied access for non-admin", async ({ page }) => {
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    const deniedBanner = page.getByText("Truy cập bị từ chối");
    const deniedMessage = page.getByText("Bạn không có quyền truy cập trang này");

    const redirected = !currentUrl.includes("/sysadmin/restaurants");
    const hasDeniedUi = (await deniedBanner.count()) > 0 || (await deniedMessage.count()) > 0;

    if (!redirected && !hasDeniedUi) {
      throw new Error("Non-admin is not denied from lock management page");
    }
  });
});

Scenario("ITC_6.4 - Thiếu lý do khóa", async ({ I, loginPage }) => {
  await clearClientSession(I);
  await loginAsAdmin(I, loginPage);

  goToRestaurants(I);
  I.fillField(searchInputSelector, lockDraft.restaurantName);
  I.waitForTableRow(lockDraft.restaurantName);
  await ensureTenantActive(I, lockDraft.restaurantName);

  openLockDialog(I, lockDraft.restaurantName);
  I.fillField("#lock-reason", "");
  I.fillField("#lock-duration", "7");
  I.click("Xác nhận khóa");

  I.waitForText("Lý do khóa là bắt buộc", 5);
  I.click("Hủy");
  I.waitForDialogToClose();
  I.waitForTableRowStatus(lockDraft.restaurantName, "Active");
});

Scenario("ITC_6.5 - Thời hạn khóa không hợp lệ", async ({ I, loginPage }) => {
  await clearClientSession(I);
  await loginAsAdmin(I, loginPage);

  goToRestaurants(I);
  I.fillField(searchInputSelector, lockDraft.restaurantName);
  I.waitForTableRow(lockDraft.restaurantName);
  await ensureTenantActive(I, lockDraft.restaurantName);

  openLockDialog(I, lockDraft.restaurantName);
  I.fillField("#lock-reason", "Vi phạm chính sách vận hành");
  I.fillField("#lock-duration", "0");
  I.click("Xác nhận khóa");
  I.waitForText("Thời hạn khóa phải trong khoảng 1 - 365 ngày", 5);

  I.fillField("#lock-duration", "400");
  I.click("Xác nhận khóa");
  I.waitForText("Thời hạn khóa phải trong khoảng 1 - 365 ngày", 5);

  I.click("Hủy");
  I.waitForDialogToClose();
  I.waitForTableRowStatus(lockDraft.restaurantName, "Active");
});

Scenario("ITC_6.1 - Admin khóa nhà hàng với dữ liệu hợp lệ", async ({ I, loginPage }) => {
  await clearClientSession(I);
  await loginAsAdmin(I, loginPage);

  goToRestaurants(I);
  I.fillField(searchInputSelector, lockDraft.restaurantName);
  I.waitForTableRow(lockDraft.restaurantName);
  await ensureTenantActive(I, lockDraft.restaurantName);

  openLockDialog(I, lockDraft.restaurantName);
  I.fillField("#lock-reason", "Vi phạm chính sách vận hành");
  I.fillField("#lock-duration", "7");
  I.click("Xác nhận khóa");
  I.waitForDialogToClose();
  I.waitForTableRowStatus(lockDraft.restaurantName, "Locked");
});

Scenario("ITC_6.2 - Không cho khóa nhà hàng đã bị khóa", async ({ I, loginPage }) => {
  await clearClientSession(I);
  await loginAsAdmin(I, loginPage);

  if (!tenantId) {
    throw new Error("tenantId is empty. ITC_6.SETUP must run first.");
  }

  const apiResult = await I.usePlaywrightTo("call lock API on already locked tenant", async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem("accessToken") || "");

    const response = await fetch(`http://localhost:5000/api/v1/tenants/${tenantId}/lock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason: "Vi phạm chính sách vận hành",
        lockDurationDays: 7,
        isPermanent: false,
      }),
    });

    const text = await response.text();
    let body: any = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: text };
    }

    return {
      status: response.status,
      code: body?.code || body?.error?.code || "",
      body,
    };
  });

  if (![400, 409].includes(apiResult.status)) {
    throw new Error(`Expected 400/409 when locking already locked tenant. Actual: ${apiResult.status}`);
  }

  if (apiResult.code !== "Tenant.AlreadyLocked") {
    throw new Error(`Expected error code Tenant.AlreadyLocked. Actual: ${apiResult.code}`);
  }
});

Scenario("ITC_6.6 - Nhà hàng đã khóa không thể hoạt động bình thường", async ({ I, loginPage }) => {
  await clearClientSession(I);

  I.amOnPage("/login");
  loginPage.sendForm(lockDraft.email, lockDraft.password);

  await I.usePlaywrightTo("assert locked tenant cannot login to operate", async ({ page }) => {
    await page.waitForTimeout(1500);

    const url = page.url();
    const lockedMessage = page.getByText("Cửa hàng của bạn đã bị khóa", { exact: false });
    const loginErrorTitle = page.getByText("Lỗi đăng nhập", { exact: false });

    const stillAtLogin = url.includes("/login");
    const hasLockedMessage = (await lockedMessage.count()) > 0 || (await loginErrorTitle.count()) > 0;

    if (!stillAtLogin || !hasLockedMessage) {
      throw new Error("Locked tenant owner should not be able to login and operate");
    }
  });
});

Scenario("ITC_6.CLEANUP - Mở khóa và xóa dữ liệu test", async ({ I, loginPage }) => {
  await clearClientSession(I);
  await loginAsAdmin(I, loginPage);

  goToRestaurants(I);
  I.fillField(searchInputSelector, lockDraft.restaurantName);
  I.waitForTableRow(lockDraft.restaurantName);

  const isLocked = await I.usePlaywrightTo("check lock status before cleanup", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: lockDraft.restaurantName }).first();
    return (await row.getByText("Locked").count()) > 0;
  });

  if (isLocked) {
    I.clickTableRowActionAndAcceptPopup(lockDraft.restaurantName, 0);
    I.waitForTableRowStatus(lockDraft.restaurantName, "Active");
  }

  I.clickTableRowAction(lockDraft.restaurantName, 1);
  I.confirmAlertDialog();
  I.assertNoTableRow(lockDraft.restaurantName);
});
