/// <reference path="../../../steps.d.ts" />

Feature('Xác thực - Kiểm tra khởi tạo giao diện');

// [AUTH-01]: Truy cập trang chủ khi chưa đăng nhập sẽ chuyển hướng về trang đăng nhập
Scenario('[AUTH-01] Truy cập trang chủ khi chưa đăng nhập sẽ chuyển hướng về trang đăng nhập', ({ I }) => {
  I.amOnPage('/');
  I.waitInUrl('/login', 5);
  I.waitForText('S2O Restaurant', 5);
});
