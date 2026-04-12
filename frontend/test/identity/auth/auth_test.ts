/// <reference path="../../../steps.d.ts" />
import { testData } from "../data/user_data";

Feature('Xác thực - Kiểm tra giao diện và logic đăng nhập');

// [AUTH-02]: Trang đăng nhập hiển thị đúng các thành phần giao diện
Scenario('[AUTH-02] Trang đăng nhập hiển thị đúng các thành phần giao diện', ({ I }) => {
  I.amOnPage('/login');
  I.waitForText('S2O Restaurant', 5);
  I.seeElement('input[type="email"]');
  I.seeElement('input[type="password"]');
  I.seeElement('button[type="submit"]');
});

// [AUTH-04]: Đăng nhập thành công với quyền System Admin — chuyển hướng đến /dashboard
Scenario('[AUTH-04] Đăng nhập thành công với quyền System Admin — chuyển hướng đến /dashboard', ({ I, loginPage }) => {
  I.amOnPage('/login');
  loginPage.sendForm(testData.admin.email, testData.admin.password);
  I.waitInUrl('/dashboard', 10);
});

// [AUTH-05]: Đăng nhập thành công với quyền Owner — chuyển hướng đến /owner/dashboard
Scenario('[AUTH-05] Đăng nhập thành công với quyền Owner — chuyển hướng đến /owner/dashboard', ({ I, loginPage }) => {
  I.amOnPage('/login');
  loginPage.sendForm(testData.owner.email, testData.owner.password);
  I.waitInUrl('/owner/dashboard', 10);
});

// [AUTH-06]: Đăng nhập thất bại khi sai mật khẩu — hiển thị thông báo lỗi
Scenario('[AUTH-06] Đăng nhập thất bại khi sai mật khẩu — hiển thị thông báo lỗi', ({ I, loginPage }) => {
  I.amOnPage('/login');
  loginPage.sendForm(testData.admin.email, 'WrongPassword123');
  I.waitForText('Mật khẩu không đúng', 5);
});
