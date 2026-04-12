/// <reference path="../../../steps.d.ts" />
import { testData } from "../data/user_data";

// ---------------------------------------------------------------------------
// Điều hướng trang System Admin
// ---------------------------------------------------------------------------
Feature('Điều hướng - Trang System Admin');

// [NAV-01]: System Admin đăng nhập — trang dashboard tải thành công
Before(({ I, loginPage }) => {
  I.amOnPage('/login');
  loginPage.sendForm(testData.admin.email, testData.admin.password);
  I.waitInUrl('/dashboard', 10);
});

Scenario('[NAV-01] System Admin đăng nhập — trang dashboard tải thành công', ({ I }) => {
  I.seeInCurrentUrl('/dashboard');
  I.waitForText('Operational', 10);
});

// [NAV-03]: System Admin có thể truy cập /sysadmin/dashboard
Scenario('[NAV-03] System Admin có thể truy cập /sysadmin/dashboard', ({ I }) => {
  I.amOnPage('/sysadmin/dashboard');
  I.waitInUrl('/sysadmin/dashboard', 10);
  I.waitForText('Operational', 10);
});

// [NAV-04]: System Admin có thể truy cập /sysadmin/restaurants
Scenario('[NAV-04] System Admin có thể truy cập /sysadmin/restaurants', ({ I }) => {
  I.amOnPage('/sysadmin/restaurants');
  I.waitInUrl('/sysadmin/restaurants', 10);
  I.waitForElement('table', 10);
});

// [NAV-05]: System Admin có thể truy cập /sysadmin/users
Scenario('[NAV-05] System Admin có thể truy cập /sysadmin/users', ({ I }) => {
  I.amOnPage('/sysadmin/users');
  I.waitInUrl('/sysadmin/users', 10);
  I.waitForElement('table', 10);
});

// [NAV-06]: System Admin có thể truy cập /sysadmin/ai-config
Scenario('[NAV-06] System Admin có thể truy cập /sysadmin/ai-config', ({ I }) => {
  I.amOnPage('/sysadmin/ai-config');
  I.waitInUrl('/sysadmin/ai-config', 10);
  I.waitForElement('[role="slider"]', 10);
});

// [NAV-07]: System Admin có thể truy cập /sysadmin/settings
Scenario('[NAV-07] System Admin có thể truy cập /sysadmin/settings', ({ I }) => {
  I.amOnPage('/sysadmin/settings');
  I.waitInUrl('/sysadmin/settings', 10);
  I.waitForElement('[role="tablist"]', 10);
});

// ---------------------------------------------------------------------------
// Điều hướng trang Owner
// ---------------------------------------------------------------------------
Feature('Điều hướng - Trang Owner');

// [NAV-02]: Owner đăng nhập — trang dashboard Owner tải thành công
Before(({ I, loginPage }) => {
  I.amOnPage('/login');
  loginPage.sendForm(testData.owner.email, testData.owner.password);
  I.waitInUrl('/owner/dashboard', 10);
});

Scenario('[NAV-02] Owner đăng nhập — trang dashboard Owner tải thành công', ({ I }) => {
  I.seeInCurrentUrl('/owner/dashboard');
  I.waitForElement('a[href="/owner/staff"]', 10);
});

// [NAV-08]: Owner có thể truy cập /owner/dashboard
Scenario('[NAV-08] Owner có thể truy cập /owner/dashboard', ({ I }) => {
  I.amOnPage('/owner/dashboard');
  I.waitInUrl('/owner/dashboard', 10);
  I.waitForElement('a[href="/owner/staff"]', 10);
});

// [NAV-09]: Owner có thể truy cập /owner/menu
Scenario('[NAV-09] Owner có thể truy cập /owner/menu', ({ I }) => {
  I.amOnPage('/owner/menu');
  I.waitInUrl('/owner/menu', 10);
  I.waitForElement('input[placeholder="Tìm món ăn theo tên..."]', 10);
});

// [NAV-10]: Owner có thể truy cập /owner/qr-codes
Scenario('[NAV-10] Owner có thể truy cập /owner/qr-codes', ({ I }) => {
  I.amOnPage('/owner/qr-codes');
  I.waitInUrl('/owner/qr-codes', 10);
  I.waitForElement('[role="combobox"]', 10);
});

// [NAV-11]: Owner có thể truy cập /owner/branches
Scenario('[NAV-11] Owner có thể truy cập /owner/branches', ({ I }) => {
  I.amOnPage('/owner/branches');
  I.waitInUrl('/owner/branches', 10);
  I.waitForText('Sơ đồ bàn', 10);
});

// [NAV-12]: Owner có thể truy cập /owner/staff
Scenario('[NAV-12] Owner có thể truy cập /owner/staff', ({ I }) => {
  I.amOnPage('/owner/staff');
  I.waitInUrl('/owner/staff', 10);
  I.waitForText('Thêm nhân viên', 10);
});

// [NAV-13]: Owner có thể truy cập /owner/revenue
Scenario('[NAV-13] Owner có thể truy cập /owner/revenue', ({ I }) => {
  I.amOnPage('/owner/revenue');
  I.waitInUrl('/owner/revenue', 10);
  I.waitForElement('[role="tablist"]', 10);
});

// [NAV-14]: Owner có thể truy cập /owner/settings
Scenario('[NAV-14] Owner có thể truy cập /owner/settings', ({ I }) => {
  I.amOnPage('/owner/settings');
  I.waitInUrl('/owner/settings', 10);
  I.waitForElement('[role="tablist"]', 10);
});
