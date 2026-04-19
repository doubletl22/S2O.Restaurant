const { I } = inject();

export = {
  // Luu selector dang nhap thanh mot cho de test thay doi it diem hon khi UI doi.
  fields: {
    email: "input[type=\"email\"]",
    password: "input[type=\"password\"]"
  },
  submitButton: "button[type=\"submit\"]",

  // Helper nay dien thong tin va gui form dang nhap.
  sendForm(email: string, password: string) {
    // Dien email vao o dang nhap dang hien.
    I.fillField(this.fields.email, email);
    // Dien mat khau vao o dang nhap dang hien.
    I.fillField(this.fields.password, password);
    // Nhan nut submit de kich hoat quy trinh xac thuc.
    I.click(this.submitButton);
  }
}
