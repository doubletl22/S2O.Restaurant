/// <reference path="../../../steps.d.ts" />

Feature('Xác thực - Kiểm tra định dạng form và kiểm soát truy cập');

// [AUTH-03]: Gửi form trống — ở lại trang đăng nhập
Scenario('[AUTH-03] Gửi form trống — ở lại trang đăng nhập', ({ I }) => {
  I.amOnPage('/login');
  I.click('button[type="submit"]');
  I.seeInCurrentUrl('/login');
  I.waitForText('S2O Restaurant', 5);
});

// [AUTH-07]: Truy cập trực tiếp trái phép vào /sysadmin/dashboard khi chưa đăng nhập
Scenario('[AUTH-07] Truy cập trực tiếp trái phép vào /sysadmin/dashboard khi chưa đăng nhập sẽ chuyển hướng về trang đăng nhập', ({ I }) => {
  I.amOnPage('/sysadmin/dashboard');
  I.waitForText('S2O Restaurant', 5);
  I.seeInCurrentUrl('/login');
});
