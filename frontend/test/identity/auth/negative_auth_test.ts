/// <reference path="../../../steps.d.ts" />

Feature("Xác thực - Kiểm tra định dạng form và kiểm soát truy cập");

// [AUTH-03]: Gửi form trống — ở lại trang đăng nhập
Scenario("[AUTH-03] Gửi form trống — ở lại trang đăng nhập", ({ I }) => {
  // Mo login page de kiem tra validate khi nguoi dung khong nhap gi.
  I.amOnPage("/login");
  // Submit truc tiep form rong.
  I.click("button[type=\"submit\"]");
  // Neu validate dung, nguoi dung van o lai trang login.
  I.seeInCurrentUrl("/login");
  // Tieu de van hien thi de xac nhan khong co redirect ngoai y muon.
  I.waitForText("S2O Restaurant", 5);
});

// [AUTH-07]: Truy cập trực tiếp trái phép vào /sysadmin/dashboard khi chưa đăng nhập
Scenario("[AUTH-07] Truy cập trực tiếp trái phép vào /sysadmin/dashboard khi chưa đăng nhập sẽ chuyển hướng về trang đăng nhập", ({ I }) => {
  // Thu vao thang trang bao ve de kiem tra access control.
  I.amOnPage("/sysadmin/dashboard");
  // Giao dien login phai xuat hien thay vi noi dung dashboard.
  I.waitForText("S2O Restaurant", 5);
  // URL phai bi ep quay ve login cho nguoi chua xac thuc.
  I.seeInCurrentUrl("/login");
});
