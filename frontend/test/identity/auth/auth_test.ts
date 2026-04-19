/// <reference path="../../../steps.d.ts" />
import { testData } from "../data/user_data";

Feature("Xác thực - Kiểm tra giao diện và logic đăng nhập");

// [AUTH-02]: Trang đăng nhập hiển thị đúng các thành phần giao diện
Scenario("[AUTH-02] Trang đăng nhập hiển thị đúng các thành phần giao diện", ({ I }) => {
  // Mo man hinh login lam diem bat dau kiem tra UI.
  I.amOnPage("/login");
  // Cho den khi branding hien ra de tranh assert qua som.
  I.waitForText("S2O Restaurant", 5);
  // O email la truong bat buoc de nhap danh tinh nguoi dung.
  I.seeElement("input[type=\"email\"]");
  // O password la truong xac thuc bi mat.
  I.seeElement("input[type=\"password\"]");
  // Nut submit kich hoat luong dang nhap.
  I.seeElement("button[type=\"submit\"]");
});

// [AUTH-04]: Đăng nhập thành công với quyền System Admin — chuyển hướng đến /dashboard
Scenario("[AUTH-04] Đăng nhập thành công với quyền System Admin — chuyển hướng đến /dashboard", ({ I, loginPage }) => {
  // Bat dau tai trang login truoc khi gui thong tin xac thuc.
  I.amOnPage("/login");
  // Dang nhap bang tai khoan System Admin de kiem tra phan quyen thanh cong.
  loginPage.sendForm(testData.admin.email, testData.admin.password);
  // Sau khi dang nhap dung, he thong phai dua Admin ve dashboard tong quan.
  I.waitInUrl("/dashboard", 10);
});

// [AUTH-05]: Đăng nhập thành công với quyền Owner — chuyển hướng đến /owner/dashboard
Scenario("[AUTH-05] Đăng nhập thành công với quyền Owner — chuyển hướng đến /owner/dashboard", ({ I, loginPage }) => {
  // Mo login page de thuc hien dang nhap bang role Owner.
  I.amOnPage("/login");
  // Tai khoan Owner phai duoc gan dung namespace route rieng.
  loginPage.sendForm(testData.owner.email, testData.owner.password);
  // Dieu huong thanh cong xac nhan co tach dashboard cho chu nha hang.
  I.waitInUrl("/owner/dashboard", 10);
});

// [AUTH-06]: Đăng nhập thất bại khi sai mật khẩu — hiển thị thông báo lỗi
Scenario("[AUTH-06] Đăng nhập thất bại khi sai mật khẩu — hiển thị thông báo lỗi", ({ I, loginPage }) => {
  // Mo man hinh login de kiem tra nhanh xu ly credential sai.
  I.amOnPage("/login");
  // Co tinh dung mat khau sai de xac minh he thong tu choi xac thuc.
  loginPage.sendForm(testData.admin.email, "WrongPassword123");
  // Thong bao loi xac nhan backend/frontend da chan dang nhap that bai.
  I.waitForText("Mật khẩu không đúng", 5);
});
