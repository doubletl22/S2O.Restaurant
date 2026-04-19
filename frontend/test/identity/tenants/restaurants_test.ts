/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";
import { ensureRestaurantDraft } from "../support/identity_prereq";

// Tao suffix de ten nha hang va email owner test khong bi trung giua cac lan chay.
const suffix = randomUUID().slice(0, 8);
const EXTRA_CASES_ENABLED = process.env.IDENTITY_INCLUDE_EXTRA_CASES === "true";
const draft = {
  restaurantName: `Nha hang ${suffix}`,
  ownerName: `Chu quan ${suffix}`,
  email: `owner_${suffix}@s2o.test`,
  password: "Quan11209",
  address: `123 Nguyen Hue ${suffix}`,
  phoneNumber: "0909123456",
};

type RestaurantDraft = typeof draft;

// Cac moc chieu dai mat khau cho Boundary Value Analysis.
const REST_NOMINAL_PASSWORD = "Abc@1234567890abcdefghijkl"; // 28 chars
const REST_MIN_PASSWORD = "Abc@12"; // 6 chars
const REST_MIN_PLUS_PASSWORD = "Abc@123"; // 7 chars
const REST_MAX_MINUS_PASSWORD = "Abc@123456789012345678901234567890123456789abcd"; // 49 chars
const REST_MAX_PASSWORD = "Abc@123456789012345678901234567890123456789abcde"; // 50 chars
const RESTAURANT_SEARCH_INPUT = 'input[placeholder*="Tìm theo Tên"], input[placeholder*="Tìm kiếm nhà hàng"]';

function buildRestaurantDraft(id: string, password: string): RestaurantDraft {
  // Moi case BVA tao tenant rieng de khong va cham voi du lieu cua case khac.
  return {
    restaurantName: `Nha hang BVA ${id} ${suffix}`,
    ownerName: `Chu quan BVA ${id}`,
    email: `owner_bva_${id}_${suffix}@s2o.test`,
    password,
    address: `123 Nguyen Hue BVA ${id}`,
    phoneNumber: "0909123456",
  };
}

function goToRestaurants(I: CodeceptJS.I) {
  // Dua test ve trang quan ly nha hang truoc khi thao tac CRUD.
  I.amOnPage("/sysadmin/restaurants");
  I.waitInUrl("/sysadmin/restaurants", 10);
}

function openCreateRestaurantDialog(I: CodeceptJS.I) {
  I.usePlaywrightTo("mo dialog dang ky nha hang", async ({ page }) => {
    const createButton = page.getByRole("button", { name: "Đăng ký mới" });
    const dialog = page.getByRole("dialog");

    await createButton.waitFor({ state: "visible", timeout: 10000 });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      // Force click + retry de giam flaky khi button dang animate hoac bi overlay.
      await createButton.click({ force: true });

      try {
        await dialog.waitFor({ state: "visible", timeout: 3000 });
        return;
      } catch {
        await page.waitForTimeout(300);
      }
    }

    throw new Error("Unable to open restaurant registration dialog");
  });
}

function createRestaurant(I: CodeceptJS.I, restaurantDraft: RestaurantDraft) {
  // Mo dialog dang ky tenant moi.
  openCreateRestaurantDialog(I);
  I.waitForElement("input[placeholder=\"Kichi Kichi...\"]", 10);
  // Dien day du thong tin nha hang, owner va tai khoan.
  I.fillTenantRegistrationDialog(restaurantDraft);
  // Gui form khoi tao tenant.
  I.click("Khởi tạo Nhà hàng");
  // Cho dialog dong han de biet request da ket thuc.
  I.waitForDialogToClose();
  // Toast thanh cong giup phan biet loi tao tenant voi loi dong bo danh sach.
  I.waitForText("Khởi tạo nhà hàng thành công", 10);
}

function verifyRestaurantCreated(I: CodeceptJS.I, restaurantName: string) {
  // Tim dung nha hang vua tao trong bang ket qua.
  I.waitForElement(RESTAURANT_SEARCH_INPUT, 10);
  I.fillField(RESTAURANT_SEARCH_INPUT, restaurantName);
  I.waitForTableRow(restaurantName);
}

function cleanupRestaurant(I: CodeceptJS.I, restaurantName: string) {
  // Tim lai nha hang muc tieu truoc khi xoa.
  I.waitForElement(RESTAURANT_SEARCH_INPUT, 10);
  I.fillField(RESTAURANT_SEARCH_INPUT, restaurantName);
  I.clickTableRowAction(restaurantName, 1);
  // Xac nhan popup de hoan tat thao tac xoa.
  I.confirmAlertDialog();
  I.assertNoTableRow(restaurantName);
}

async function ensureMainRestaurantReady(isLocked: boolean) {
  await ensureRestaurantDraft(draft, { isLocked });
}

function expectCreateRestaurantRejected(I: CodeceptJS.I, restaurantName: string, expectedMessage: string) {
  I.see(expectedMessage);
  I.seeElement("[role=\"dialog\"]");
  I.closeDialog();
  I.waitForDialogToClose();
  goToRestaurants(I);
  I.waitForElement(RESTAURANT_SEARCH_INPUT, 10);
  I.fillField(RESTAURANT_SEARCH_INPUT, restaurantName);
  I.assertNoTableRow(restaurantName);
}

Feature("Quản lý nhà hàng");

Before(({ I, loginPage }) => {
  // Dang nhap bang System Admin vi chi role nay duoc quan ly tenant.
  I.amOnPage("/login");
  loginPage.sendForm(testData.admin.email, testData.admin.password);
  I.waitInUrl("/dashboard", 10);
});

Scenario("[REST-01] System Admin có thể truy cập trang quản lý nhà hàng", ({ I }) => {
  goToRestaurants(I);
  // Bang du lieu la dau hieu chinh cho thay trang CRUD da tai xong.
  I.waitForElement("table", 10);
});

Scenario("[REST-02] Đăng ký mới một nhà hàng", ({ I }) => {
  goToRestaurants(I);
  createRestaurant(I, draft);
  // Xuat hien dong moi trong bang xac nhan tenant duoc tao thanh cong.
  verifyRestaurantCreated(I, draft.restaurantName);
});

Scenario("[REST-03] Khóa một nhà hàng đang hoạt động", async ({ I }) => {
  await ensureMainRestaurantReady(false);
  goToRestaurants(I);
  // Tim dung nha hang can doi trang thai.
  I.fillField(RESTAURANT_SEARCH_INPUT, draft.restaurantName);
  I.waitForTableRow(draft.restaurantName);
  // Menu action dau tien doi giua Active va Locked.
  I.clickTableRowActionAndAcceptPopup(draft.restaurantName, 0);
  I.waitForTableRowStatus(draft.restaurantName, "Locked");
});

Scenario("[REST-04] Mở khóa một nhà hàng đang bị khóa", async ({ I }) => {
  await ensureMainRestaurantReady(true);
  goToRestaurants(I);
  I.fillField(RESTAURANT_SEARCH_INPUT, draft.restaurantName);
  I.waitForTableRow(draft.restaurantName);
  // Click lai cung action do de dua tenant ve trang thai hoat dong.
  I.clickTableRowActionAndAcceptPopup(draft.restaurantName, 0);
  I.waitForTableRowStatus(draft.restaurantName, "Active");
});

Scenario("[REST-05] Xóa một nhà hàng", async ({ I }) => {
  await ensureMainRestaurantReady(false);
  goToRestaurants(I);
  I.fillField(RESTAURANT_SEARCH_INPUT, draft.restaurantName);
  I.waitForTableRow(draft.restaurantName);
  I.clickTableRowAction(draft.restaurantName, 1);
  I.confirmAlertDialog();
  I.assertNoTableRow(draft.restaurantName);
});

// Standard BVA - Owner password [min=6, min+=7, nom=28, max-=49, max=50]
// Moi case tao tenant rieng, xac minh tao duoc roi cleanup de dam bao doc lap.
Scenario("[BVA-REST-01] Nominal - Owner password=28 chars", ({ I }) => {
  const restaurantDraft = buildRestaurantDraft("01", REST_NOMINAL_PASSWORD);
  goToRestaurants(I);
  createRestaurant(I, restaurantDraft);
  verifyRestaurantCreated(I, restaurantDraft.restaurantName);
  cleanupRestaurant(I, restaurantDraft.restaurantName);
});

Scenario("[BVA-REST-02] Owner password min=6 chars", ({ I }) => {
  const restaurantDraft = buildRestaurantDraft("02", REST_MIN_PASSWORD);
  goToRestaurants(I);
  createRestaurant(I, restaurantDraft);
  verifyRestaurantCreated(I, restaurantDraft.restaurantName);
  cleanupRestaurant(I, restaurantDraft.restaurantName);
});

Scenario("[BVA-REST-03] Owner password min+=7 chars", ({ I }) => {
  const restaurantDraft = buildRestaurantDraft("03", REST_MIN_PLUS_PASSWORD);
  goToRestaurants(I);
  createRestaurant(I, restaurantDraft);
  verifyRestaurantCreated(I, restaurantDraft.restaurantName);
  cleanupRestaurant(I, restaurantDraft.restaurantName);
});

Scenario("[BVA-REST-04] Owner password max-=49 chars", ({ I }) => {
  const restaurantDraft = buildRestaurantDraft("04", REST_MAX_MINUS_PASSWORD);
  goToRestaurants(I);
  createRestaurant(I, restaurantDraft);
  verifyRestaurantCreated(I, restaurantDraft.restaurantName);
  cleanupRestaurant(I, restaurantDraft.restaurantName);
});

Scenario("[BVA-REST-05] Owner password max=50 chars", ({ I }) => {
  const restaurantDraft = buildRestaurantDraft("05", REST_MAX_PASSWORD);
  goToRestaurants(I);
  createRestaurant(I, restaurantDraft);
  verifyRestaurantCreated(I, restaurantDraft.restaurantName);
  cleanupRestaurant(I, restaurantDraft.restaurantName);
});

if (EXTRA_CASES_ENABLED) {
  Scenario("[BVA-REST-06] Dirty - Owner password min-=5 chars", ({ I }) => {
    const restaurantDraft = buildRestaurantDraft("06", "Abc@1");
    goToRestaurants(I);
    openCreateRestaurantDialog(I);
    I.waitForElement("input[placeholder=\"Kichi Kichi...\"]", 10);
    I.fillTenantRegistrationDialog(restaurantDraft);
    I.click("Khởi tạo Nhà hàng");
    expectCreateRestaurantRejected(I, restaurantDraft.restaurantName, "Tối thiểu 6 ký tự");
  });

  Scenario("[BVA-REST-07] Dirty - Owner password max+=51 chars", ({ I }) => {
    const restaurantDraft = buildRestaurantDraft("07", `${REST_MAX_PASSWORD}f`);
    goToRestaurants(I);
    // Form dang ky tenant hien tai chi rang buoc min=6 cho password, nen 51 ky tu van hop le.
    createRestaurant(I, restaurantDraft);
    verifyRestaurantCreated(I, restaurantDraft.restaurantName);
    cleanupRestaurant(I, restaurantDraft.restaurantName);
  });
}
