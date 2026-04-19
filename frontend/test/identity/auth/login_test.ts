/// <reference path="../../../steps.d.ts" />

Feature("Xác thực - Kiểm tra khởi tạo giao diện");

// [AUTH-01]: Truy cập trang chủ khi chưa đăng nhập sẽ chuyển hướng về trang đăng nhập
Scenario("[AUTH-01] Truy cập trang chủ khi chưa đăng nhập sẽ chuyển hướng về trang đăng nhập", ({ I }) => {
  // Vao trang goc de kiem tra middleware/guard cho nguoi chua dang nhap.
  I.amOnPage("/");
  // URL phai doi sang /login neu phien dang nhap chua ton tai.
  I.waitInUrl("/login", 5);
  // Tieu de ung dung xac nhan giao dien login da render xong.
  I.waitForText("S2O Restaurant", 5);
});
