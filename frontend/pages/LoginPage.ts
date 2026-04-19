/// <reference types="codeceptjs" />

const { I } = inject();

export = {
  // Gom thao tac dang nhap vao page object de cac test khong lap lai selector.
  sendForm(email: string, password: string) {
    // Dien email vao truong nhan dien tai khoan.
    I.fillField("#email", email);
    // Dien mat khau vao truong xac thuc.
    I.fillField("#password", password);
    // Gui form dang nhap bang nut submit tren giao dien.
    I.click("Đăng nhập");
  }
};
