/// <reference types="codeceptjs" />

const { I } = inject();

export = {
  sendForm(email: string, password: string) {
    I.fillField('#email', email);
    I.fillField('#password', password);
    I.click('Đăng nhập');
  }
};
