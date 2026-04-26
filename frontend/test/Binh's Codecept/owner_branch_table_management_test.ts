/// <reference path="../../steps.d.ts" />

import { randomUUID } from "node:crypto";
import { testData } from "../identity/data/user_data";

Feature("Owner quản lý Chi nhánh và Bàn");

const suffix = randomUUID().slice(0, 8);
const viewDelaySeconds = Number(process.env.E2E_VIEW_DELAY_SECONDS || "2");
const binhOwnerEmail = process.env.CODECEPT_OWNER_EMAIL || "binhvo@s2o.com";
const binhOwnerPassword = process.env.CODECEPT_OWNER_PASSWORD || "Binh2518";

const branchDraft = {
  name: `CN Binh ${suffix}`,
  address: `123 Nguyen Hue ${suffix}`,
  phone: "0909123456",
  updatedName: `CN Da Sua ${suffix}`,
};

const tableDraft = {
  name: `Ban Binh ${suffix}`,
  capacity: 4,
  updatedName: `Ban Da Sua ${suffix}`,
  updatedCapacity: 8,
};

const categoryName = `Danh muc Binh ${suffix}`;
const guestProductNames = [`Mon Binh 1 ${suffix}`, `Mon Binh 2 ${suffix}`];
const managerDraft = {
  fullName: `Quan ly Binh ${suffix}`,
  email: `manager.binh.${suffix}@s2o.com`,
  password: `Manager@${suffix}`,
  phoneNumber: `0911${suffix.slice(-6)}`,
};

function exactLengthText(seed: string, length: number) {
  return seed.length >= length ? seed.slice(0, length) : `${seed}${"x".repeat(length - seed.length)}`;
}

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
        // Ignore storage errors in pages that have not fully loaded yet.
      }
    });
  });
}

function goToBranches(I: CodeceptJS.I) {
  I.amOnPage("/owner/branches");
  I.waitInUrl("/owner/branches", 10);
  I.waitForText("Chi nhánh", 10);
}

function loginAsOwner(I: CodeceptJS.I, loginPage: any) {
  I.amOnPage("/login");
  loginPage.sendForm(binhOwnerEmail, binhOwnerPassword);
  I.waitInUrl("/owner/dashboard", 10);
}

async function loginAs(I: CodeceptJS.I, email: string, password: string, expectedUrl: string) {
  I.amOnPage("/login");
  I.fillField("#email", email);
  I.fillField("#password", password);
  I.click("Đăng nhập");
  I.waitInUrl(expectedUrl, 20);
}

async function logout(I: CodeceptJS.I) {
  await I.usePlaywrightTo("logout current user", async ({ page }) => {
    const forceLogin = async () => {
      await page.context().clearCookies();
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // Ignore storage cleanup issues during fallback logout.
        }
      });
      await page.goto(new URL("/login", page.url()).toString(), { waitUntil: "commit" });
    };

    page.once("dialog", (dialog: any) => dialog.accept());

    const logoutButton = page.getByRole("button", { name: "Đăng xuất" });
    if (await logoutButton.count()) {
      await logoutButton.last().click({ force: true });
      try {
        await page.waitForURL(/\/login/, { timeout: 5000, waitUntil: "commit" });
      } catch {
        await forceLogin();
      }
      return;
    }

    const logoutMenuItem = page.getByRole("menuitem", { name: "Đăng xuất" });
    if (await logoutMenuItem.count()) {
      await logoutMenuItem.last().click({ force: true });
      try {
        await page.waitForURL(/\/login/, { timeout: 5000, waitUntil: "commit" });
      } catch {
        await forceLogin();
      }
      return;
    }

    await forceLogin();
  });
}

async function openComboboxOption(I: CodeceptJS.I, comboboxIndex: number, optionLabel: string) {
  await I.usePlaywrightTo(`choose combobox option ${optionLabel}`, async ({ page }) => {
    const comboboxes = page.getByRole("combobox");
    await comboboxes.nth(comboboxIndex).click();
    await page.getByRole("option", { name: optionLabel }).click();
  });
}

function openBranchCreateDialog(I: CodeceptJS.I) {
  I.click("Thêm");
  I.waitForElement("[role=\"dialog\"]", 10);
  I.waitForText("Thêm chi nhánh mới", 10);
}

function createBranch(I: CodeceptJS.I, name: string, address: string, phone: string) {
  openBranchCreateDialog(I);
  I.fillField("Tên chi nhánh", name);
  I.fillField("Địa chỉ", address);
  I.fillField("Số điện thoại", phone);
  I.click("Tạo chi nhánh");
  I.waitForText("Thêm chi nhánh thành công", 10);
  I.waitForCard(address);
}

function openBranchEditDialog(I: CodeceptJS.I, branchCardText: string) {
  I.usePlaywrightTo("open edit branch dialog", async ({ page }) => {
    const branchCard = page.locator(".group").filter({ hasText: branchCardText }).first();

    await branchCard.waitFor({ state: "visible", timeout: 10000 });
    await branchCard.hover();
    await branchCard.locator("button").first().click();
  });

  I.waitForElement("[role=\"dialog\"]", 10);
  I.waitForText("Cập nhật chi nhánh", 10);
}

function updateBranch(I: CodeceptJS.I, oldAddress: string, newName: string) {
  openBranchEditDialog(I, oldAddress);
  I.fillField("Tên chi nhánh", newName);
  I.click("Lưu thay đổi");
  I.waitForText("Cập nhật chi nhánh thành công", 10);
  I.waitForText(newName, 10);
}

function selectBranchByName(I: CodeceptJS.I, name: string) {
  I.usePlaywrightTo("select branch card", async ({ page }) => {
    const branchCard = page.locator(".group").filter({ hasText: name }).first();

    await branchCard.waitFor({ state: "visible", timeout: 10000 });
    await branchCard.click();
  });

  I.waitForText("Sơ đồ bàn", 10);
}

async function createCategory(I: CodeceptJS.I, name: string) {
  I.amOnPage("/owner/menu");
  I.waitForText("Danh mục", 20);
  await I.usePlaywrightTo("open category dialog", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /Thêm danh mục|Tạo danh mục|Thêm/i }).first();
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

async function createManagerForBranch(I: CodeceptJS.I, branchLabel: string) {
  I.amOnPage("/owner/staff");
  I.waitForText("Quản lý nhân viên", 20);
  I.click("Thêm nhân viên");
  I.waitForText("Thêm nhân viên mới", 20);

  await I.usePlaywrightTo("fill manager dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog").last();
    const inputs = dialog.locator("input");

    await inputs.nth(0).fill(managerDraft.email);
    await inputs.nth(1).fill(managerDraft.password);
    await inputs.nth(2).fill(managerDraft.fullName);
    await inputs.nth(3).fill(managerDraft.phoneNumber);

    const selects = dialog.getByRole("combobox");
    await selects.nth(0).click();
    await page.getByRole("option", { name: "Quản lý" }).click();
    await selects.nth(1).click();
    await page.getByRole("option", { name: branchLabel, exact: true }).click();
  });

  I.click("Lưu thay đổi");
  I.waitForText(managerDraft.fullName, 20);
}

function openTableCreateDialog(I: CodeceptJS.I) {
  I.usePlaywrightTo("open create table dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Thêm bàn" }).first().click();
  });

  I.waitForElement("[role=\"dialog\"]", 10);
  I.waitForText("Thêm bàn mới", 10);
}

function chooseTableStatus(I: CodeceptJS.I, statusLabel: "Trống" | "Có khách" | "Ngừng phục vụ") {
  I.usePlaywrightTo(`choose table status ${statusLabel}`, async ({ page }) => {
    const dialog = page.getByRole("dialog").last();

    await dialog.getByRole("combobox").click();
    await page.getByRole("option", { name: statusLabel, exact: true }).click();
  });
}

function createTable(I: CodeceptJS.I, tableName: string, capacity: number, status: "Trống" | "Có khách" | "Ngừng phục vụ") {
  openTableCreateDialog(I);
  I.fillField("Tên bàn", tableName);
  I.fillField("Số ghế (Capacity)", String(capacity));
  chooseTableStatus(I, status);
  I.usePlaywrightTo("submit table dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog").last();
    const submitButton = dialog.getByRole("button", { name: "Thêm bàn" });

    await submitButton.waitFor({ state: "visible", timeout: 10000 });
    await submitButton.click({ force: true });
  });

  I.waitForText(tableName, 10);
  I.waitForText(String(capacity), 10);
  I.waitForText(status, 10);
}

function openTableEditDialog(I: CodeceptJS.I, tableName: string) {
  I.usePlaywrightTo("open edit table dialog", async ({ page }) => {
    const tableCard = page.locator("div.aspect-square").filter({ hasText: tableName }).first();

    await tableCard.waitFor({ state: "visible", timeout: 10000 });
    await tableCard.hover();
    await tableCard.getByRole("button", { name: "Chỉnh sửa" }).click();
  });

  I.waitForElement("[role=\"dialog\"]", 10);
  I.waitForText("Cập nhật bàn", 10);
}

function updateTable(
  I: CodeceptJS.I,
  oldTableName: string,
  newTableName: string,
  newCapacity: number,
  newStatus: "Trống" | "Có khách" | "Ngừng phục vụ",
) {
  openTableEditDialog(I, oldTableName);
  I.fillField("Tên bàn", newTableName);
  I.fillField("Số ghế (Capacity)", String(newCapacity));
  chooseTableStatus(I, newStatus);
  I.click("Lưu");

  I.waitForText("Cập nhật bàn thành công", 10);
  I.waitForText(newTableName, 10);
  I.waitForText(String(newCapacity), 10);
  I.waitForText(newStatus, 10);
}

function deleteTable(I: CodeceptJS.I, tableName: string) {
  I.usePlaywrightTo("delete table card", async ({ page }) => {
    const tableCard = page.locator("div.aspect-square").filter({ hasText: tableName }).first();

    await tableCard.waitFor({ state: "visible", timeout: 10000 });
    page.once("dialog", (dialog: any) => dialog.accept());
    await tableCard.hover();
    await tableCard.getByRole("button", { name: "Xóa" }).click();
  });

  I.waitForText("Đã xóa bàn", 10);
  I.dontSee(tableName);
}

function deleteBranch(I: CodeceptJS.I, branchCardText: string) {
  I.hoverCardAndClickLastButtonWithPopup(branchCardText);
  I.waitForText("Đã xóa chi nhánh", 10);
  I.assertNoCard(branchCardText);
}

async function collectQrLinks(I: CodeceptJS.I, branchLabel: string) {
  I.amOnPage("/owner/qr-codes");
  I.waitForText("Tạo mã QR", 20);
  await openComboboxOption(I, 0, branchLabel);
  I.click("Chọn tất cả");
  I.wait(2);

  let qrLinks: string[] = [];

  await I.usePlaywrightTo("collect qr links", async ({ page }) => {
    const matches = await page.locator("p").evaluateAll((nodes: any[]) =>
      nodes
        .map((node: any) => (node.textContent || "").trim())
        .filter((text: string) => text.includes("/guest/t/"))
    );

    if (matches.length === 0) {
      throw new Error("Không tìm thấy link QR nào trên trang in mã QR.");
    }

    qrLinks = matches;
  });

  return qrLinks;
}

async function addGuestProducts(I: CodeceptJS.I, guestUrl: string) {
  I.amOnPage(guestUrl);
  I.waitForText("Thực đơn", 20);

  for (const productName of guestProductNames) {
    await I.usePlaywrightTo(`add guest product ${productName}`, async ({ page }) => {
      const card = page.locator("div.relative.flex.gap-3").filter({ hasText: productName }).first();
      await card.waitFor({ state: "visible", timeout: 10000 });
      await card.getByRole("button").click();
    });
  }
}

async function placeGuestOrder(I: CodeceptJS.I, guestUrl: string) {
  I.amOnPage(`${guestUrl}/cart`);
  I.waitForText("Giỏ hàng", 20);
  for (const productName of guestProductNames) {
    I.waitForText(productName, 20);
  }
  I.click("Xác nhận đặt món");
  I.waitForText("Mã đơn:", 20);
}

async function verifyTableStatus(I: CodeceptJS.I, tableName: string, expectedStatus: "Có khách" | "Trống") {
  I.amOnPage("/staff/tables");
  I.waitForText("Các bàn trong chi nhánh", 20);

  await I.usePlaywrightTo(`verify ${tableName} status is ${expectedStatus}`, async ({ page }) => {
    const statusBadge = page
      .locator("[data-slot='card']")
      .filter({ hasText: tableName })
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
    const card = page
      .locator("div")
      .filter({ hasText: guestProductNames[0] })
      .filter({ has: page.getByRole("button", { name: "Xác nhận" }) })
      .first();
    await card.waitFor({ state: "visible", timeout: 15000 });
    await card.getByRole("button", { name: "Xác nhận" }).click();
  });

  I.wait(2);
  await verifyTableStatus(I, tableDraft.updatedName, "Có khách");
  await takeShot(I, "13a-table-occupied-after-confirm");

  I.amOnPage("/staff/order-ticket");
  I.waitForText("Tiếp nhận đơn hàng", 20);

  await I.usePlaywrightTo("switch to invoice tab and pay", async ({ page }) => {
    await page.getByRole("tab", { name: /Hóa đơn/ }).click();
    const invoiceCard = page
      .locator("div")
      .filter({ hasText: guestProductNames[0] })
      .filter({ has: page.getByRole("button", { name: "Xem chi tiết hóa đơn" }) })
      .first();
    await invoiceCard.waitFor({ state: "visible", timeout: 15000 });
    await invoiceCard.getByRole("button", { name: "Xem chi tiết hóa đơn" }).click();
  });

  await takeShot(I, "13b-invoice-detail-before-payment");

  await I.usePlaywrightTo("confirm payment after viewing invoice", async ({ page }) => {
    await page.getByRole("button", { name: "Đã thanh toán" }).click();
  });

  I.wait(2);
  await verifyTableStatus(I, tableDraft.updatedName, "Trống");
  await takeShot(I, "13c-table-empty-after-payment");
}

Before(({ I, loginPage }) => {
  loginAsOwner(I, loginPage);
});

Scenario("[BRANCH-TABLE-01] Owner truy cập trang quản lý chi nhánh", ({ I }) => {
  goToBranches(I);
  I.see("Sơ đồ bàn");
});

Scenario("[BRANCH-TABLE-02] CRUD branch + table thành công", ({ I }) => {
  goToBranches(I);

  createBranch(I, branchDraft.name, branchDraft.address, branchDraft.phone);
  updateBranch(I, branchDraft.address, branchDraft.updatedName);

  selectBranchByName(I, branchDraft.updatedName);

  createTable(I, tableDraft.name, tableDraft.capacity, "Trống");
  updateTable(I, tableDraft.name, tableDraft.updatedName, tableDraft.updatedCapacity, "Có khách");

  deleteTable(I, tableDraft.updatedName);
  deleteBranch(I, branchDraft.address);
});

Scenario("[BVA-BRANCH-TABLE-01] Boundary tên chi nhánh 1 và 50 ký tự", ({ I }) => {
  goToBranches(I);

  const branchNameMin = "A";
  const branchAddressMin = `ADDR-MIN-${suffix}`;

  createBranch(I, branchNameMin, branchAddressMin, "0909111222");
  deleteBranch(I, branchAddressMin);

  const branchNameMax = exactLengthText(`BRANCH-MAX-${suffix}`, 50);
  const branchAddressMax = `ADDR-MAX-${suffix}`;

  createBranch(I, branchNameMax, branchAddressMax, "0909333444");
  deleteBranch(I, branchAddressMax);
});

Scenario("[BVA-BRANCH-TABLE-02] Boundary tên bàn 1/50 ký tự và sức chứa tối thiểu", ({ I }) => {
  goToBranches(I);

  const boundaryBranchName = `CN Boundary ${suffix}`;
  const boundaryBranchAddress = `ADDR-TABLE-BVA-${suffix}`;

  createBranch(I, boundaryBranchName, boundaryBranchAddress, "0909555666");
  selectBranchByName(I, boundaryBranchName);

  const tableNameMin = "B";
  createTable(I, tableNameMin, 1, "Trống");
  deleteTable(I, tableNameMin);

  const tableNameMax = exactLengthText(`TABLE-MAX-${suffix}`, 50);
  createTable(I, tableNameMax, 10, "Ngừng phục vụ");
  deleteTable(I, tableNameMax);

  deleteBranch(I, boundaryBranchAddress);
});

Scenario("[BRANCH-TABLE-FULL-01] Branch/table flow end-to-end with screenshots", async ({ I }) => {
  await clearBrowserSession(I);

  await loginAs(I, binhOwnerEmail, binhOwnerPassword, "/owner/dashboard");
  await takeShot(I, "01-owner-dashboard");

  goToBranches(I);
  await takeShot(I, "02-branches-opened");

  createBranch(I, branchDraft.name, branchDraft.address, branchDraft.phone);
  await takeShot(I, "03-branch-created");

  updateBranch(I, branchDraft.address, branchDraft.updatedName);
  await takeShot(I, "04-branch-updated");

  selectBranchByName(I, branchDraft.updatedName);
  await takeShot(I, "05-branch-selected-for-tables");

  createTable(I, tableDraft.name, tableDraft.capacity, "Trống");
  await takeShot(I, "06-table-created");

  updateTable(I, tableDraft.name, tableDraft.updatedName, tableDraft.updatedCapacity, "Trống");
  await takeShot(I, "07-table-updated");

  await createCategory(I, categoryName);
  await takeShot(I, "08-category-created");

  I.amOnPage("/owner/menu");
  for (const [index, productName] of guestProductNames.entries()) {
    await createProduct(I, productName, index + 1);
  }
  await takeShot(I, "09-products-created");

  await createManagerForBranch(I, branchDraft.updatedName);
  await takeShot(I, "10-manager-created");

  const qrLinks = await collectQrLinks(I, branchDraft.updatedName);
  await takeShot(I, "11-qr-links-visible");

  await addGuestProducts(I, qrLinks[0]);
  await takeShot(I, "12-guest-cart-filled");

  await placeGuestOrder(I, qrLinks[0]);
  await takeShot(I, "13-guest-order-placed");

  await clearBrowserSession(I);
  await loginAs(I, managerDraft.email, managerDraft.password, "/staff/order-ticket");
  await confirmAndPayOrder(I);
  await takeShot(I, "14-order-confirmed-and-paid");

  await logout(I);

  await loginAs(I, binhOwnerEmail, binhOwnerPassword, "/owner/dashboard");
  I.amOnPage("/owner/branches");
  I.waitForText("Chi nhánh", 20);
  selectBranchByName(I, branchDraft.updatedName);
  deleteTable(I, tableDraft.updatedName);
  deleteBranch(I, branchDraft.address);
  await takeShot(I, "15-cleanup-completed");
});
