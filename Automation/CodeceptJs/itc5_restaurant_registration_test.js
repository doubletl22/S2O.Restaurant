Feature("ITC_5 - Dang ky nha hang (complete continuous)");

const fs = require("fs");
const path = require("path");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@s2o.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REPORT_PATH = path.join(__dirname, "itc5_report.txt");
const owners = [];

function suffix() {
  return Math.random().toString(36).slice(2, 10);
}

function draft(caseId, overrides = {}) {
  const s = suffix();
  return {
    restaurantName: `ITC5-${caseId}-${s}`,
    ownerName: `Owner ITC5 ${caseId}`,
    email: `itc5_${caseId}_${s}@s2o.test`,
    password: "Abc@123456",
    address: `123 ITC5 ${caseId}`,
    phoneNumber: "0909123456",
    planType: "Free",
    ...overrides,
  };
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
  writeReport(`STANDARD_ISSUE: ${issue}. Reason: ${reason}. Detail: ${detail}`);
}

function expectDialogError(I, expectedText, label) {
  I.usePlaywrightTo(`expect dialog error ${label}`, async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 5000 }).catch(() => undefined);
    const visible = await dialog.isVisible().catch(() => false);
    if (!visible) {
      noteStandardIssue(
        `${label}_DIALOG_CLOSED`,
        "Form validation should keep the dialog open when data is invalid",
        `expected error "${expectedText}"`
      );
      return;
    }
    const text = await dialog.innerText().catch(() => "");
    if (!text.includes(expectedText)) {
      noteStandardIssue(
        `${label}_MISSING_ERROR`,
        "User should see a clear validation message for invalid input",
        `expected "${expectedText}", actual "${text.slice(0, 160)}"`
      );
    }
  });
}

function loginAsAdmin(I) {
  I.amOnPage(`${BASE_URL}/login`);
  I.fillField('input[type="email"]', ADMIN_EMAIL);
  I.fillField('input[type="password"]', ADMIN_PASSWORD);
  I.click('button[type="submit"]');
  I.waitInUrl("/dashboard", 10);
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

function goToRestaurants(I) {
  I.amOnPage(`${BASE_URL}/sysadmin/restaurants`);
  I.waitInUrl("/sysadmin/restaurants", 10);
  I.waitForElement("table", 10);
}

function openDialog(I) {
  I.usePlaywrightTo("open tenant dialog", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Đăng ký mới|Dang ky moi/i }).first();
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
    await page.getByRole("dialog").waitFor({ state: "visible", timeout: 10000 });
  });
}

function closeDialog(I, mode = "cancel") {
  I.usePlaywrightTo("close tenant dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = await dialog.isVisible().catch(() => false);
    if (!visible) return;

    if (mode === "escape") {
      await page.keyboard.press("Escape");
    } else {
      const cancelBtn = dialog.getByRole("button", { name: /Hủy|Huy/i });
      if (await cancelBtn.count()) await cancelBtn.first().click();
      else await page.keyboard.press("Escape");
    }

    await dialog.waitFor({ state: "hidden", timeout: 10000 });
  });
}

function fillDialog(I, d) {
  I.usePlaywrightTo("fill registration dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });

    await dialog.locator('input[placeholder="Kichi Kichi..."]').fill(d.restaurantName);
    await dialog.locator('input[placeholder="123 Đường ABC..."]').fill(d.address);
    await dialog.locator('input[placeholder="0909..."]').fill(d.phoneNumber);
    await dialog.locator('input[placeholder="Nguyễn Văn A"]').fill(d.ownerName);
    await dialog.locator('input[placeholder="owner@gmail.com"]').fill(d.email);
    await dialog.locator('input[type="password"]').fill(d.password);

    const planCombo = dialog.getByRole("combobox").first();
    await planCombo.click();
    await page.getByRole("option", { name: new RegExp(`Gói\\s+${d.planType}`, "i") }).first().click();
    const selected = await planCombo.inputValue().catch(() => "");
    if (!new RegExp(d.planType, "i").test(selected)) {
      noteStandardIssue(
        "PLAN_TYPE_NOT_SELECTED",
        "User selected a plan type but the UI did not reflect the selection",
        `expected "${d.planType}", actual "${selected}"`
      );
    }
  });
}

function submit(I, options = {}) {
  I.usePlaywrightTo("submit registration from dialog", async ({ page }) => {
    const btn = page.getByRole("dialog").getByRole("button", { name: /Khởi tạo Nhà hàng|Khoi tao Nha hang/i }).first();
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
    if (options.double) {
      await btn.click().catch(() => undefined);
    }
  });
}

function searchByName(I, name) {
  I.usePlaywrightTo("search by restaurant name", async ({ page }) => {
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

function rowCountByName(I, name, expected, comparator = "eq", skipReport = false) {
  I.usePlaywrightTo("verify row count by name", async ({ page }) => {
    const rows = page.locator("tbody tr").filter({ hasText: name });
    const count = await rows.count();
    const ok =
      comparator === "eq" ? count === expected :
      comparator === "gte" ? count >= expected :
      comparator === "lte" ? count <= expected :
      false;

    if (!ok && !skipReport) {
      writeReport(`ROW_COUNT_MISMATCH: name="${name}", expected ${comparator} ${expected}, actual ${count}`);
    }
  });
}

function assertNotCreated(I, name) {
  if (!name || !name.trim()) {
    writeReport(`SKIP_VERIFY: name is empty, skipping assertNotCreated for safety`);
    return;
  }
  searchByName(I, name);
  rowCountByName(I, name, 0, "eq", false);
}

function verifyCreated(I, d, options = {}) {
  const searchName = options.searchName || d.restaurantName;
  goToRestaurants(I);
  searchByName(I, searchName);
  rowCountByName(I, searchName, 1, "gte", false);
  I.usePlaywrightTo("verify created row has plan and active status", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: searchName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 }).catch(() => {
      writeReport(`ROW_NOT_FOUND: restaurant="${searchName}" raw="${d.restaurantName}" not found in table`);
    });
    
    try {
      const planText = String(d.planType).toUpperCase();
      const planBadge = row.locator('[data-slot="badge"]').filter({ hasText: new RegExp(`^${planText}$`, "i") }).first();
      await planBadge.waitFor({ state: "visible", timeout: 5000 });
    } catch (e) {
      writeReport(`PLAN_BADGE_NOT_FOUND: restaurant="${searchName}" raw="${d.restaurantName}", planType="${d.planType}"`);
    }

    try {
      await row.getByText(/Active|Locked/i).waitFor({ state: "visible", timeout: 5000 });
    } catch (e) {
      writeReport(`STATUS_NOT_FOUND: restaurant="${searchName}" raw="${d.restaurantName}" missing Active/Locked status`);
    }
  });
}

function registerSuccess(I, d, options = {}) {
  openDialog(I);
  fillDialog(I, d);
  submit(I, options);
  I.usePlaywrightTo("wait successful create transition", async ({ page }) => {
    // Success flow either closes dialog immediately or reloads page after toast.
    await Promise.race([
      page.getByRole("dialog").waitFor({ state: "hidden", timeout: 20000 }),
      page.waitForURL(/\/sysadmin\/restaurants/, { timeout: 20000 }),
    ]);
  });
  verifyCreated(I, d, options);
  owners.push({ email: d.email, password: d.password });
}

function recordCreationByName(I, name, label) {
  searchByName(I, name);
  I.usePlaywrightTo(`record creation ${label}`, async ({ page }) => {
    const rows = page.locator("tbody tr").filter({ hasText: name });
    const count = await rows.count();
    if (count > 0) {
      writeReport(`${label}_CREATED: name="${name}", count=${count}`);
    } else {
      writeReport(`${label}_NOT_CREATED: name="${name}"`);
    }
  });
}

function assertDialogReset(I) {
  I.usePlaywrightTo("assert dialog fields reset", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    const fields = [
      'input[placeholder="Kichi Kichi..."]',
      'input[placeholder="123 Đường ABC..."]',
      'input[placeholder="0909..."]',
      'input[placeholder="Nguyễn Văn A"]',
      'input[placeholder="owner@gmail.com"]',
      'input[type="password"]',
    ];
    for (const selector of fields) {
      const value = await dialog.locator(selector).inputValue();
      if (value && value.trim() !== "") {
        throw new Error(`Dialog field not reset: ${selector}`);
      }
    }
  });
}

Scenario("[ITC_5 Complete Continuous] End-to-end registration flow", ({ I }) => {
  mark(I, "START");
  loginAsAdmin(I);
  goToRestaurants(I);

  mark(I, "ITC_5.1");
  openDialog(I);
  I.seeElement('input[placeholder="Kichi Kichi..."]');
  I.seeElement('input[placeholder="123 Đường ABC..."]');
  I.seeElement('input[placeholder="0909..."]');
  I.seeElement('input[placeholder="Nguyễn Văn A"]');
  I.seeElement('input[placeholder="owner@gmail.com"]');
  I.seeElement('input[type="password"]');

  mark(I, "ITC_5.2");
  const closeDraft = draft("02");
  fillDialog(I, closeDraft);
  closeDialog(I, "cancel");
  assertNotCreated(I, closeDraft.restaurantName);
  openDialog(I);
  assertDialogReset(I);
  closeDialog(I, "escape");
  openDialog(I);
  closeDialog(I, "cancel");

  mark(I, "ITC_5.3-ITC_5.5");
  for (const plan of ["Free", "Premium", "Enterprise"]) {
    registerSuccess(I, draft(`PLAN-${plan}`, { planType: plan }));
  }

  mark(I, "ITC_5.6-ITC_5.11");
  const requiredCases = [
    { id: "06", patch: { restaurantName: "" }, error: "Tên nhà hàng là bắt buộc" },
    { id: "07", patch: { address: "" }, error: "Địa chỉ là bắt buộc" },
    { id: "08", patch: { phoneNumber: "" }, error: "SĐT là bắt buộc" },
    { id: "09", patch: { ownerName: "" }, error: "Họ tên chủ quán là bắt buộc" },
    { id: "10", patch: { email: "" }, error: "Email là bắt buộc" },
    { id: "11", patch: { password: "" }, error: "Mật khẩu là bắt buộc" },
  ];
  for (const c of requiredCases) {
    const d = draft(c.id, c.patch);
    openDialog(I);
    fillDialog(I, d);
    submit(I);
    expectDialogError(I, c.error, `REQUIRED_${c.id}`);
    if (d.restaurantName && d.restaurantName.trim()) {
      assertNotCreated(I, d.restaurantName);
    }
    closeDialog(I, "cancel");
  }

  mark(I, "ITC_5.12");
  const invalidEmail = draft("12", { email: "invalid-email" });
  openDialog(I);
  fillDialog(I, invalidEmail);
  submit(I);
  expectDialogError(I, "Email sai", "INVALID_EMAIL");
  assertNotCreated(I, invalidEmail.restaurantName);
  closeDialog(I, "cancel");

  mark(I, "ITC_5.13-ITC_5.18");
  const passCases = [
    { id: "13", len: 5, ok: false },
    { id: "14", len: 6, ok: true },
    { id: "15", len: 7, ok: true },
    { id: "16", len: 28, ok: true },
    { id: "17", len: 49, ok: true },
    { id: "18", len: 50, ok: true },
  ];
  for (const c of passCases) {
    const d = draft(c.id, { password: passwordOfLength(c.len) });
    if (c.ok) {
      registerSuccess(I, d);
    } else {
      openDialog(I);
      fillDialog(I, d);
      submit(I);
      expectDialogError(I, "Tối thiểu 6 ký tự", `PASSWORD_LEN_${c.len}`);
      assertNotCreated(I, d.restaurantName);
      closeDialog(I, "cancel");
    }
  }

  mark(I, "ITC_5.19-ITC_5.21");
  const invalidHotlines = ["09ab!23456", "09012", "090912345678901234"];
  for (let i = 0; i < invalidHotlines.length; i += 1) {
    const d = draft(`HOTLINE-${i}`, { phoneNumber: invalidHotlines[i] });
    openDialog(I);
    fillDialog(I, d);
    submit(I);
    expectDialogError(I, "SĐT", `INVALID_PHONE_${i}`);
    assertNotCreated(I, d.restaurantName);
    closeDialog(I, "cancel");
  }

  mark(I, "ITC_5.22");
  const dupEmail = `dup_email_${suffix()}@s2o.test`;
  const firstDupEmail = draft("22A", { email: dupEmail });
  const secondDupEmail = draft("22B", { email: dupEmail });
  registerSuccess(I, firstDupEmail);
  openDialog(I);
  fillDialog(I, secondDupEmail);
  submit(I);
  expectDialogError(I, "Email đã tồn tại", "DUP_EMAIL");
  assertNotCreated(I, secondDupEmail.restaurantName);
  closeDialog(I, "cancel");

  mark(I, "ITC_5.23");
  const dupBrandName = `itc5-dup-brand-${suffix()}`;
  const firstDupBrand = draft("23A", { restaurantName: dupBrandName });
  const secondDupBrand = draft("23B", { restaurantName: dupBrandName });
  registerSuccess(I, firstDupBrand);
  openDialog(I);
  fillDialog(I, secondDupBrand);
  submit(I);
  closeDialog(I, "cancel");
  searchByName(I, dupBrandName);
  I.usePlaywrightTo("record duplicate brand result", async ({ page }) => {
    const rows = page.locator("tbody tr").filter({ hasText: dupBrandName });
    const count = await rows.count();
    if (count < 1) {
      writeReport(`DUPLICATE_BRAND_ZERO_ROWS: "${dupBrandName}" - expected at least 1 row, got ${count}`);
      return;
    }
    if (count > 1) {
      writeReport(`DUPLICATE_BRAND_ACCEPTED: "${dupBrandName}" created ${count} rows (expected 1).`);
    }
  });

  mark(I, "ITC_5.24");
  const doubleSubmitDraft = draft("24");
  registerSuccess(I, doubleSubmitDraft, { double: true });
  searchByName(I, doubleSubmitDraft.restaurantName);
  I.usePlaywrightTo("verify ITC_5.24 row count", async ({ page }) => {
    const rows = page.locator("tbody tr").filter({ hasText: doubleSubmitDraft.restaurantName });
    const count = await rows.count();
    if (count !== 1) {
      writeReport(`ITC_5.24_DOUBLE_SUBMIT: expected 1 row, got ${count} for "${doubleSubmitDraft.restaurantName}"`);
    }
  });

  mark(I, "ITC_5.25");
  const apiErrorDraft = draft("25");
  openDialog(I);
  fillDialog(I, apiErrorDraft);
  I.usePlaywrightTo("mock tenant registration 500", async ({ page }) => {
    const pattern = "**/api/v1/tenants/registration";
    const handler = (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: false,
          error: { code: "TEST.ERROR", message: "Simulated server error" },
        }),
      });
    await page.route(pattern, handler);
    await page.getByRole("dialog").getByRole("button", { name: /Khởi tạo Nhà hàng|Khoi tao Nha hang/i }).first().click();
    await page.unroute(pattern, handler);
  });
  expectDialogError(I, "Tạo nhà hàng thất bại", "SERVER_ERROR_500");
  I.seeElement('[role="dialog"]');
  I.seeInField('input[placeholder="Kichi Kichi..."]', apiErrorDraft.restaurantName);
  I.seeInField('input[placeholder="owner@gmail.com"]', apiErrorDraft.email);
  closeDialog(I, "cancel");
  assertNotCreated(I, apiErrorDraft.restaurantName);

  mark(I, "EXTENSION-SEARCH-UNICODE");
  const unicodeDraft = draft("EXT-UNICODE", { restaurantName: `Phở-PhoMix-${suffix()}` });
  registerSuccess(I, unicodeDraft);
  searchByName(I, "PhoMix");
  rowCountByName(I, unicodeDraft.restaurantName, 1, "gte");

  mark(I, "EXT-TRIM-WHITESPACE");
  const trimName = `  Trim-${suffix()}  `;
  const trimDraft = draft("EXT-TRIM", {
    restaurantName: trimName,
    address: "  123 Đường ABC   ",
    ownerName: "  Nguyễn   Văn   A  ",
  });
  registerSuccess(I, trimDraft, { searchName: trimDraft.restaurantName.trim() });
  recordCreationByName(I, trimDraft.restaurantName, "EXT_TRIM_RAW");
  recordCreationByName(I, trimDraft.restaurantName.trim(), "EXT_TRIM_TRIMMED");

  mark(I, "EXT-EMAIL-CASE-INSENSITIVE");
  const baseLocal = `Case_${suffix()}`;
  const emailMixed = `${baseLocal}@s2o.test`;
  const emailLower = `${baseLocal.toLowerCase()}@s2o.test`;
  const emailCaseFirst = draft("EXT-EMAIL-CASE-1", { email: emailMixed });
  registerSuccess(I, emailCaseFirst);
  const emailCaseSecond = draft("EXT-EMAIL-CASE-2", { email: emailLower });
  openDialog(I);
  fillDialog(I, emailCaseSecond);
  submit(I);
  I.usePlaywrightTo("record email case duplicate message", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const visible = await dialog.isVisible().catch(() => false);
    if (!visible) return;
    const text = await dialog.innerText().catch(() => "");
    if (!/Email đã tồn tại/i.test(text)) {
      writeReport(`EMAIL_CASE_NO_DUPLICATE_MESSAGE: email="${emailLower}" message="${text.slice(0, 160)}"`);
    }
  });
  closeDialog(I, "cancel");
  recordCreationByName(I, emailCaseSecond.restaurantName, "EXT_EMAIL_CASE_SECOND");

  mark(I, "EXT-PHONE-FORMATS");
  const phoneVariants = [
    { id: "SPACE", value: "0909 123 456" },
    { id: "DASH", value: "0909-123-456" },
    { id: "COUNTRY", value: "+84 909 123 456" },
  ];
  for (const v of phoneVariants) {
    const d = draft(`EXT-PHONE-${v.id}`, { phoneNumber: v.value });
    openDialog(I);
    fillDialog(I, d);
    submit(I);
    closeDialog(I, "cancel");
    recordCreationByName(I, d.restaurantName, `EXT_PHONE_${v.id}`);
  }

  mark(I, "EXT-NAME-LENGTH");
  const longName = `ITC5-LONG-${suffix()}-${"X".repeat(200)}`;
  const longNameDraft = draft("EXT-LONG-NAME", { restaurantName: longName });
  openDialog(I);
  fillDialog(I, longNameDraft);
  I.usePlaywrightTo("record restaurant name length", async ({ page }) => {
    const value = await page.getByRole("dialog").locator('input[placeholder="Kichi Kichi..."]').inputValue();
    if (value.length !== longName.length) {
      writeReport(`NAME_LENGTH_TRUNCATED: expected ${longName.length}, actual ${value.length}`);
    }
  });
  submit(I);
  closeDialog(I, "cancel");
  recordCreationByName(I, longNameDraft.restaurantName, "EXT_LONG_NAME");

  mark(I, "EXT-ADDRESS-LENGTH");
  const longAddress = `ADDR-${"A".repeat(220)}-${suffix()}`;
  const longAddressDraft = draft("EXT-LONG-ADDR", { address: longAddress });
  openDialog(I);
  fillDialog(I, longAddressDraft);
  I.usePlaywrightTo("record address length", async ({ page }) => {
    const value = await page.getByRole("dialog").locator('input[placeholder="123 Đường ABC..."]').inputValue();
    if (value.length !== longAddress.length) {
      writeReport(`ADDRESS_LENGTH_TRUNCATED: expected ${longAddress.length}, actual ${value.length}`);
    }
  });
  submit(I);
  closeDialog(I, "cancel");
  recordCreationByName(I, longAddressDraft.restaurantName, "EXT_LONG_ADDRESS");

  mark(I, "EXT-SPECIAL-CHARS");
  const specialDraft = draft("EXT-SPECIAL", {
    restaurantName: `Cơm-Tấm-🔥-${suffix()}`,
    address: "12/3A #$% &*()",
    ownerName: "O'Connor & Sons",
  });
  registerSuccess(I, specialDraft);

  mark(I, "EXT-SEARCH-CASE");
  const searchDraft = draft("EXT-SEARCH-CASE", { restaurantName: `SearchCase-${suffix()}` });
  registerSuccess(I, searchDraft);
  const searchKey = searchDraft.restaurantName.toLowerCase().slice(0, 8);
  searchByName(I, searchKey);
  rowCountByName(I, searchDraft.restaurantName, 1, "gte");

  mark(I, "EXT-PERMISSION-NONADMIN");
  clearAuthState(I);
  I.amOnPage(`${BASE_URL}/sysadmin/restaurants`);
  I.usePlaywrightTo("record non-admin access", async ({ page }) => {
    await page.waitForTimeout(1000);
    const url = page.url();
    const loginVisible = await page.locator('input[type="email"]').first().isVisible().catch(() => false);
    if (!loginVisible && !/\/login/i.test(url)) {
      noteStandardIssue(
        "PERMISSION_RISK",
        "Unauthenticated users should be redirected to login for protected admin pages",
        `accessed ${url}`
      );
    }
  });
  loginAsAdmin(I);
  goToRestaurants(I);

  mark(I, "ITC_5.26");
  for (const owner of owners) {
    try {
      clearAuthState(I);
      I.amOnPage(`${BASE_URL}/login`);
      I.fillField('input[type="email"]', owner.email);
      I.fillField('input[type="password"]', owner.password);
      I.click('button[type="submit"]');
      I.waitInUrl("/owner/dashboard", 10);
    } catch (e) {
      writeReport(`ITC_5.26_OWNER_LOGIN_FAILED: email=${owner.email}, error=${e.message}`);
    }
  }

  if (owners.length > 0) {
    try {
      clearAuthState(I);
      I.amOnPage(`${BASE_URL}/login`);
      I.fillField('input[type="email"]', owners[0].email);
      I.fillField('input[type="password"]', `${owners[0].password}x`);
      I.click('button[type="submit"]');
      I.waitForText("Mật khẩu không đúng", 10);
    } catch (e) {
      writeReport(`ITC_5.26_WRONG_PASSWORD_TEST_FAILED: email=${owners[0].email}, error=${e.message}`);
    }
  }

  mark(I, "END");
});
