/// <reference path="../../steps.d.ts" />

import { testData } from "../identity/data/user_data";

Feature("Xác thực - Đăng xuất và bảo mật sau đăng xuất");

const ownerEmail = process.env.CODECEPT_OWNER_EMAIL || testData.owner.email;
const ownerPassword = process.env.CODECEPT_OWNER_PASSWORD || testData.owner.password;

function loginAsOwner(I: CodeceptJS.I, loginPage: any) {
  I.amOnPage("/login");
  loginPage.sendForm(ownerEmail, ownerPassword);
  I.waitInUrl("/owner/dashboard", 10);
}

function logoutFromOwnerMenu(I: CodeceptJS.I) {
  I.click("Owner Admin");
  I.waitForText("Đăng xuất", 5);
  I.usePlaywrightTo("click logout in open dropdown", async ({ page }) => {
    const logoutItem = page.locator(
      "[data-slot='dropdown-menu-content'][data-state='open'] [data-slot='dropdown-menu-item']",
      { hasText: "Đăng xuất" }
    );
    await logoutItem.first().click();
  });
}

Scenario("[ITC_2.1] Kiểm tra chức năng Đăng xuất thành công", ({ I, loginPage }) => {
  loginAsOwner(I, loginPage);

  logoutFromOwnerMenu(I);

  I.waitInUrl("/login", 10);
  I.see("S2O Restaurant");
  I.dontSee("Owner Admin");
});

Scenario("[ITC_2.2] Kiểm tra bảo mật với nút Back của trình duyệt", async ({ I, loginPage }) => {
  loginAsOwner(I, loginPage);

  logoutFromOwnerMenu(I);
  I.waitInUrl("/login", 10);

  I.executeScript(() => {
    window.history.back();
  });

  I.wait(1);

  const currentUrl = await I.grabCurrentUrl();
  if (currentUrl.includes("/owner/")) {
    I.refreshPage();
  }

  I.waitInUrl("/login", 10);
  I.see("S2O Restaurant");
});

Scenario("[ITC_2.3] Truy cập lại URL nội bộ sau khi đăng xuất", ({ I, loginPage }) => {
  loginAsOwner(I, loginPage);

  const protectedUrl = "/owner/dashboard";
  I.amOnPage(protectedUrl);
  I.waitInUrl(protectedUrl, 5);

  logoutFromOwnerMenu(I);
  I.waitInUrl("/login", 10);

  I.amOnPage(protectedUrl);
  I.waitInUrl("/login", 10);
  I.see("S2O Restaurant");
});

Scenario("[ITC_2.4] Kiểm tra Đăng xuất trên nhiều Tab (Multi-tab)", ({ I, loginPage }) => {
  loginAsOwner(I, loginPage);

  I.openNewTab();
  I.amOnPage("/owner/dashboard");
  I.waitInUrl("/owner/dashboard", 10);

  I.switchToPreviousTab();
  logoutFromOwnerMenu(I);
  I.waitInUrl("/login", 10);

  I.switchToNextTab();
  I.refreshPage();
  I.waitInUrl("/login", 10);
  I.see("S2O Restaurant");

  I.closeCurrentTab();
});

Scenario("[ITC_2.5] Xóa bộ nhớ cục bộ (Local Storage/Cookies)", ({ I, loginPage }) => {
  loginAsOwner(I, loginPage);

  logoutFromOwnerMenu(I);
  I.waitInUrl("/login", 10);

  I.usePlaywrightTo("verify auth storage is cleaned", async ({ page }) => {
    const storageState = await page.evaluate(() => ({
      accessToken: localStorage.getItem("accessToken"),
      user: localStorage.getItem("user"),
      cookies: document.cookie,
    }));

    if (storageState.accessToken !== null) {
      throw new Error("accessToken vẫn còn trong localStorage sau khi logout.");
    }

    if (storageState.user !== null) {
      throw new Error("user vẫn còn trong localStorage sau khi logout.");
    }

    const cookieString = storageState.cookies || "";
    const sensitiveCookies = ["token=", "auth_token=", "s2o_auth_token=", "user_role="];

    for (const cookieName of sensitiveCookies) {
      if (cookieString.includes(cookieName)) {
        throw new Error(`Cookie nhạy cảm vẫn tồn tại sau logout: ${cookieName}`);
      }
    }
  });
});
