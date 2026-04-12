/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";

const suffix = randomUUID().slice(0, 8);
const draft = {
  restaurantName: `Nha hang ${suffix}`,
  ownerName: `Chu quan ${suffix}`,
  email: `owner_${suffix}@s2o.test`,
  password: "Quan11209",
  address: `123 Nguyen Hue ${suffix}`,
  phoneNumber: "0909123456",
};

type RestaurantDraft = typeof draft;

const REST_NOMINAL_PASSWORD = "Abc@1234567890abcdefghijkl"; // 28 chars
const REST_MIN_PASSWORD = "Abc@12"; // 6 chars
const REST_MIN_PLUS_PASSWORD = "Abc@123"; // 7 chars
const REST_MAX_MINUS_PASSWORD = "Abc@123456789012345678901234567890123456789abcd"; // 49 chars
const REST_MAX_PASSWORD = "Abc@123456789012345678901234567890123456789abcde"; // 50 chars

function buildRestaurantDraft(id: string, password: string): RestaurantDraft {
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
  I.amOnPage("/sysadmin/restaurants");
  I.waitInUrl("/sysadmin/restaurants", 10);
}

function createRestaurant(I: CodeceptJS.I, restaurantDraft: RestaurantDraft) {
  I.click("Đăng ký mới");
  I.waitForElement('[role="dialog"]', 15);
  I.waitForElement('input[placeholder="Kichi Kichi..."]', 10);
  I.fillTenantRegistrationDialog(restaurantDraft);
  I.click("Khởi tạo Nhà hàng");
  I.waitForDialogToClose();
}

function verifyRestaurantCreated(I: CodeceptJS.I, restaurantName: string) {
  I.fillField('[placeholder="Tìm kiếm nhà hàng..."]', restaurantName);
  I.waitForTableRow(restaurantName);
}

function cleanupRestaurant(I: CodeceptJS.I, restaurantName: string) {
  I.fillField('[placeholder="Tìm kiếm nhà hàng..."]', restaurantName);
  I.clickTableRowAction(restaurantName, 1);
  I.confirmAlertDialog();
  I.assertNoTableRow(restaurantName);
}

Feature("Quản lý nhà hàng");

Before(({ I, loginPage }) => {
  I.amOnPage("/login");
  loginPage.sendForm(testData.admin.email, testData.admin.password);
  I.waitInUrl("/dashboard", 10);
});

Scenario("[REST-01] System Admin có thể truy cập trang quản lý nhà hàng", ({ I }) => {
  goToRestaurants(I);
  I.waitForElement("table", 10);
});

Scenario("[REST-02] Đăng ký mới một nhà hàng", ({ I }) => {
  goToRestaurants(I);
  createRestaurant(I, draft);
  I.waitForTableRow(draft.restaurantName);
});

Scenario("[REST-03] Khóa một nhà hàng đang hoạt động", ({ I }) => {
  goToRestaurants(I);
  I.fillField('[placeholder="Tìm kiếm nhà hàng..."]', draft.restaurantName);
  I.waitForTableRow(draft.restaurantName);
  I.clickTableRowActionAndAcceptPopup(draft.restaurantName, 0);
  I.waitForTableRowStatus(draft.restaurantName, "Locked");
});

Scenario("[REST-04] Mở khóa một nhà hàng đang bị khóa", ({ I }) => {
  goToRestaurants(I);
  I.fillField('[placeholder="Tìm kiếm nhà hàng..."]', draft.restaurantName);
  I.waitForTableRow(draft.restaurantName);
  I.clickTableRowActionAndAcceptPopup(draft.restaurantName, 0);
  I.waitForTableRowStatus(draft.restaurantName, "Active");
});

Scenario("[REST-05] Xóa một nhà hàng", ({ I }) => {
  goToRestaurants(I);
  I.fillField('[placeholder="Tìm kiếm nhà hàng..."]', draft.restaurantName);
  I.waitForTableRow(draft.restaurantName);
  I.clickTableRowAction(draft.restaurantName, 1);
  I.confirmAlertDialog();
  I.assertNoTableRow(draft.restaurantName);
});

// Standard BVA - Owner password [min=6, min+=7, nom=28, max-=49, max=50]
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
