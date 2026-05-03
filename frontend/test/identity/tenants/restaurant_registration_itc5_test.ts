/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";
import { ensureRestaurantDraft } from "../support/identity_prereq";

type PlanType = "Free" | "Premium" | "Enterprise";
type RestaurantDraft = {
  restaurantName: string;
  ownerName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
  planType: PlanType;
};

const suiteSuffix = randomUUID().slice(0, 8);
const SEARCH_INPUT = 'input[placeholder*="Tìm theo Tên"], input[placeholder*="Tìm kiếm nhà hàng"]';
const successfulOwners: Array<{ email: string; password: string; restaurantName: string }> = [];

function passwordOfLength(length: number) {
  const base = "Abc@";
  if (length <= base.length) return base.slice(0, length);
  return `${base}${"9".repeat(length - base.length)}`;
}

function buildDraft(caseId: string, overrides?: Partial<RestaurantDraft>): RestaurantDraft {
  const defaultDraft: RestaurantDraft = {
    restaurantName: `ITC5-${caseId}-Restaurant-${suiteSuffix}`,
    ownerName: `Owner ITC5-${caseId}`,
    email: `itc5_${caseId}_${suiteSuffix}@s2o.test`,
    password: "Abc@123456",
    address: `123 ITC5 Street ${caseId}`,
    phoneNumber: "0909123456",
    planType: "Free",
  };

  return { ...defaultDraft, ...overrides };
}

function goToRestaurants(I: CodeceptJS.I) {
  I.amOnPage("/sysadmin/restaurants");
  I.waitInUrl("/sysadmin/restaurants", 10);
  I.waitForElement("table", 10);
}

function openRegistrationDialog(I: CodeceptJS.I) {
  I.usePlaywrightTo("open tenant registration dialog", async ({ page }) => {
    const button = page.getByRole("button", { name: "Đăng ký mới" });
    const dialog = page.getByRole("dialog");
    await button.waitFor({ state: "visible", timeout: 10000 });
    await button.click({ force: true });
    await dialog.waitFor({ state: "visible", timeout: 10000 });
  });
}

function fillRegistrationDialog(I: CodeceptJS.I, draft: RestaurantDraft) {
  I.usePlaywrightTo("fill tenant registration form", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.locator('input[placeholder="Kichi Kichi..."]').fill(draft.restaurantName);
    await dialog.locator('input[placeholder="123 Đường ABC..."]').fill(draft.address);
    await dialog.locator('input[placeholder="0909..."]').fill(draft.phoneNumber);
    await dialog.locator('input[placeholder="Nguyễn Văn A"]').fill(draft.ownerName);
    await dialog.locator('input[placeholder="owner@gmail.com"]').fill(draft.email);
    await dialog.locator('input[type="password"]').fill(draft.password);

    const planSelect = dialog.getByRole("combobox");
    await planSelect.click();
    await page.getByRole("option", { name: `Gói ${draft.planType}` }).click();
  });
}

function submitRegistration(I: CodeceptJS.I, doubleSubmit = false) {
  I.usePlaywrightTo("submit tenant registration", async ({ page }) => {
    const submitButton = page.getByRole("dialog").getByRole("button", { name: "Khởi tạo Nhà hàng" });
    await submitButton.click();
    if (doubleSubmit) {
      await submitButton.click().catch(() => undefined);
    }
  });
}

function verifyCreatedInTable(I: CodeceptJS.I, draft: RestaurantDraft) {
  I.waitForElement(SEARCH_INPUT, 10);
  I.fillField(SEARCH_INPUT, draft.restaurantName);
  I.waitForTableRow(draft.restaurantName);
  I.usePlaywrightTo("verify created row plan", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: draft.restaurantName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 });
    await row.getByText(draft.planType.toUpperCase()).waitFor({ state: "visible", timeout: 5000 });
  });
}

function assertNotCreated(I: CodeceptJS.I, restaurantName: string) {
  goToRestaurants(I);
  I.waitForElement(SEARCH_INPUT, 10);
  I.fillField(SEARCH_INPUT, restaurantName);
  I.assertNoTableRow(restaurantName);
}

function registerAndVerifySuccess(I: CodeceptJS.I, draft: RestaurantDraft, options?: { doubleSubmit?: boolean }) {
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I, options?.doubleSubmit);
  I.waitForText("Khởi tạo nhà hàng thành công", 10);
  I.waitForDialogToClose();
  verifyCreatedInTable(I, draft);
  successfulOwners.push({ email: draft.email, password: draft.password, restaurantName: draft.restaurantName });
}

Feature("ITC_5 - Đăng ký nhà hàng");

Before(({ I, loginPage }) => {
  I.amOnPage("/login");
  loginPage.sendForm(testData.admin.email, testData.admin.password);
  I.waitInUrl("/dashboard", 10);
});

Scenario("[ITC_5.1] Mở dialog đăng ký nhà hàng", ({ I }) => {
  goToRestaurants(I);
  openRegistrationDialog(I);
  I.seeElement("input[placeholder=\"Kichi Kichi...\"]");
  I.seeElement("input[placeholder=\"123 Đường ABC...\"]");
  I.seeElement("input[placeholder=\"0909...\"]");
  I.seeElement("input[placeholder=\"Nguyễn Văn A\"]");
  I.seeElement("input[placeholder=\"owner@gmail.com\"]");
  I.seeElement("input[type=\"password\"]");
  I.see("Hủy");
  I.see("Khởi tạo Nhà hàng");
});

Scenario("[ITC_5.2] Đóng dialog bằng Hủy hoặc dấu X", ({ I }) => {
  const draft = buildDraft("02");
  goToRestaurants(I);

  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  I.click("Hủy");
  I.waitForDialogToClose();
  assertNotCreated(I, draft.restaurantName);

  openRegistrationDialog(I);
  fillRegistrationDialog(I, buildDraft("02x"));
  I.closeDialog();
  I.waitForDialogToClose();
});

Scenario("[ITC_5.3] Đăng ký thành công gói Free", ({ I }) => {
  const draft = buildDraft("03", { planType: "Free" });
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft);
});

Scenario("[ITC_5.4] Đăng ký thành công gói Premium", ({ I }) => {
  const draft = buildDraft("04", { planType: "Premium" });
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft);
});

Scenario("[ITC_5.5] Đăng ký thành công gói Enterprise", ({ I }) => {
  const draft = buildDraft("05", { planType: "Enterprise" });
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft);
});

Scenario("[ITC_5.6] Bỏ trống tên thương hiệu", ({ I }) => {
  const draft = buildDraft("06", { restaurantName: "" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.see("Tên nhà hàng là bắt buộc");
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, buildDraft("06").restaurantName);
});

Scenario("[ITC_5.7] Bỏ trống địa chỉ", ({ I }) => {
  const draft = buildDraft("07", { address: "" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.see("Địa chỉ là bắt buộc");
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, buildDraft("07").restaurantName);
});

Scenario("[ITC_5.8] Bỏ trống hotline", ({ I }) => {
  const draft = buildDraft("08", { phoneNumber: "" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.see("SĐT là bắt buộc");
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, buildDraft("08").restaurantName);
});

Scenario("[ITC_5.9] Bỏ trống tên chủ quán", ({ I }) => {
  const draft = buildDraft("09", { ownerName: "" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.see("Họ tên chủ quán là bắt buộc");
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, buildDraft("09").restaurantName);
});

Scenario("[ITC_5.10] Bỏ trống email", ({ I }) => {
  const draft = buildDraft("10", { email: "" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.see("Email là bắt buộc");
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, buildDraft("10").restaurantName);
});

Scenario("[ITC_5.11] Bỏ trống mật khẩu", ({ I }) => {
  const draft = buildDraft("11", { password: "" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.see("Mật khẩu là bắt buộc");
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, buildDraft("11").restaurantName);
});

Scenario("[ITC_5.12] Email sai định dạng", ({ I }) => {
  const draft = buildDraft("12", { email: "invalid-email" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.see("Email sai");
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, buildDraft("12").restaurantName);
});

Scenario("[ITC_5.13] Mật khẩu 5 ký tự", ({ I }) => {
  const draft = buildDraft("13", { password: passwordOfLength(5) });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.see("Tối thiểu 6 ký tự");
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, buildDraft("13").restaurantName);
});

Scenario("[ITC_5.14] Mật khẩu 6 ký tự", ({ I }) => {
  const draft = buildDraft("14", { password: passwordOfLength(6) });
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft);
});

Scenario("[ITC_5.15] Mật khẩu 7 ký tự", ({ I }) => {
  const draft = buildDraft("15", { password: passwordOfLength(7) });
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft);
});

Scenario("[ITC_5.16] Mật khẩu 28 ký tự", ({ I }) => {
  const draft = buildDraft("16", { password: passwordOfLength(28) });
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft);
});

Scenario("[ITC_5.17] Mật khẩu 49 ký tự", ({ I }) => {
  const draft = buildDraft("17", { password: passwordOfLength(49) });
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft);
});

Scenario("[ITC_5.18] Mật khẩu 50 ký tự", ({ I }) => {
  const draft = buildDraft("18", { password: passwordOfLength(50) });
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft);
});

Scenario("[ITC_5.19] Hotline chứa chữ/ký tự đặc biệt", ({ I }) => {
  const draft = buildDraft("19", { phoneNumber: "09ab!23456" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, draft.restaurantName);
});

Scenario("[ITC_5.20] Hotline ngắn hơn quy định", ({ I }) => {
  const draft = buildDraft("20", { phoneNumber: "09012" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, draft.restaurantName);
});

Scenario("[ITC_5.21] Hotline dài hơn quy định", ({ I }) => {
  const draft = buildDraft("21", { phoneNumber: "090912345678901234" });
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  submitRegistration(I);
  I.seeElement("[role=\"dialog\"]");
  assertNotCreated(I, draft.restaurantName);
});

Scenario("[ITC_5.22] Đăng ký bằng email đã tồn tại", async ({ I }) => {
  const duplicateEmail = `itc5_dup_email_${suiteSuffix}@s2o.test`;
  const seedDraft = buildDraft("22-seed", { email: duplicateEmail, restaurantName: `ITC5-22-seed-${suiteSuffix}` });
  const targetDraft = buildDraft("22", { email: duplicateEmail });

  await ensureRestaurantDraft(seedDraft);
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, targetDraft);
  submitRegistration(I);
  I.waitForText("Email đã tồn tại", 10);
  I.seeElement("[role=\"dialog\"]");
  I.usePlaywrightTo("verify duplicate email suggested", async ({ page }) => {
    const emailValue = await page.getByRole("dialog").locator('input[placeholder="owner@gmail.com"]').inputValue();
    if (!emailValue.includes("+")) {
      throw new Error("Expected email suggestion with +suffix after duplicate email.");
    }
  });
  assertNotCreated(I, targetDraft.restaurantName);
});

Scenario("[ITC_5.23] Đăng ký bằng tên thương hiệu trùng", async ({ I }) => {
  const duplicatedName = `ITC5-23-brand-${suiteSuffix}`;
  const seedDraft = buildDraft("23-seed", { restaurantName: duplicatedName });
  const targetDraft = buildDraft("23", { restaurantName: duplicatedName });

  await ensureRestaurantDraft(seedDraft);
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, targetDraft);
  submitRegistration(I);

  I.usePlaywrightTo("close dialog if still open", async ({ page }) => {
    await page.waitForTimeout(1200);
    const dialog = page.getByRole("dialog");
    const visible = await dialog.isVisible().catch(() => false);
    if (visible) {
      const cancelButton = dialog.getByRole("button", { name: "Hủy" });
      await cancelButton.click();
      await dialog.waitFor({ state: "hidden", timeout: 10000 });
    }
  });

  goToRestaurants(I);
  I.fillField(SEARCH_INPUT, duplicatedName);
  I.usePlaywrightTo("assert no duplicate tenant rows by name", async ({ page }) => {
    await page.waitForTimeout(1200);
    const rows = page.locator("tbody tr").filter({ hasText: duplicatedName });
    const count = await rows.count();
    if (count !== 1) {
      throw new Error(`Expected exactly 1 tenant row for duplicated brand test, but found ${count}.`);
    }
  });
});

Scenario("[ITC_5.24] Submit liên tiếp 2 lần", ({ I }) => {
  const draft = buildDraft("24");
  goToRestaurants(I);
  registerAndVerifySuccess(I, draft, { doubleSubmit: true });
  I.usePlaywrightTo("assert single created row after double submit", async ({ page }) => {
    const rows = page.locator("tbody tr").filter({ hasText: draft.restaurantName });
    const count = await rows.count();
    if (count !== 1) {
      throw new Error(`Expected 1 row after double submit, found ${count}.`);
    }
  });
});

Scenario("[ITC_5.25] Mô phỏng lỗi API khi submit", ({ I }) => {
  const draft = buildDraft("25");
  goToRestaurants(I);
  openRegistrationDialog(I);
  fillRegistrationDialog(I, draft);
  I.usePlaywrightTo("mock API error for tenant registration", async ({ page }) => {
    const routeHandler = (route: any) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ code: "TEST.ERROR", message: "Simulated server error" }),
      });
    await page.route("**/api/v1/tenants/registration", routeHandler);
    await page.getByRole("dialog").getByRole("button", { name: "Khởi tạo Nhà hàng" }).click();
    await page.unroute("**/api/v1/tenants/registration", routeHandler);
  });
  I.waitForText("Tạo nhà hàng thất bại", 10);
  I.seeElement("[role=\"dialog\"]");
  I.usePlaywrightTo("assert data remains in dialog after API failure", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    const nameValue = await dialog.locator('input[placeholder="Kichi Kichi..."]').inputValue();
    if (nameValue !== draft.restaurantName) {
      throw new Error("Expected draft data to remain in dialog after API error.");
    }
  });
  assertNotCreated(I, draft.restaurantName);
});

Scenario("[ITC_5.26] Đăng nhập toàn bộ owner đã tạo + thử sai mật khẩu 1 lần", ({ I, loginPage }) => {
  if (successfulOwners.length === 0) {
    const fallbackDraft = buildDraft("26-fallback");
    goToRestaurants(I);
    registerAndVerifySuccess(I, fallbackDraft);
  }

  const owners = [...successfulOwners];
  const firstOwner = owners[0];
  if (!firstOwner) {
    throw new Error("No successful owner account available for ITC_5.26.");
  }

  I.usePlaywrightTo("clear auth state before owner login checks", async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  for (const owner of owners) {
    I.amOnPage("/login");
    loginPage.sendForm(owner.email, owner.password);
    I.waitInUrl("/owner/dashboard", 10);
    I.usePlaywrightTo("clear session for next owner", async ({ page }) => {
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    });
  }

  I.amOnPage("/login");
  loginPage.sendForm(firstOwner.email, `${firstOwner.password}x`);
  I.waitForText("Mật khẩu không đúng", 10);
  I.seeInCurrentUrl("/login");
});
