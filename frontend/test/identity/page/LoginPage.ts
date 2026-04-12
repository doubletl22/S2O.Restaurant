const { I } = inject();

export = {
  // Các selector trên giao diện (hãy điều chỉnh theo HTML thực tế của bạn)
  fields: {
    email: 'input[type="email"]',
    password: 'input[type="password"]'
  },
  submitButton: 'button[type="submit"]',

  // Hàm thực hiện đăng nhập
  sendForm(email: string, password: string) {
    I.fillField(this.fields.email, email);
    I.fillField(this.fields.password, password);
    I.click(this.submitButton);
  }
}