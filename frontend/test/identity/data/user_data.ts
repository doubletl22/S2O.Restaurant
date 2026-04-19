export const testData = {
  admin: {
    // Tai khoan System Admin dung cho cac test quan tri cap he thong.
    email: "admin@s2o.com",
    password: "Admin@123",
  },
  owner: {
    // Tai khoan Owner dung cho cac test quan ly nha hang, staff va chi nhanh.
    email: "quantran@s525o.com",
    password: "Quan11209",
  },
  newTenant: {
    // Mau du lieu tao nha hang moi trong cac test dang ky tenant.
    restaurantName: "Nha Hang S2O",
    ownerName: "Nguyen Van Chu",
    email: "quantran@s525o.com",
    password: "Quan11209",
    address: "123 Nguyen Hue, Q1, TP.HCM",
    phoneNumber: "0909123456",
  },
  staff: {
    // Du lieu staff mau de mo phong luong tao/sua nhan vien.
    fullName: "Nguyen Thi Nhan Vien",
    email: "staff_test@phobac.com",
    password: "Staff@123",
    phoneNumber: "0901234567",
    updatedName: "Nguyen Thi Cap Nhat",
  },
  newUser: {
    // Du lieu admin moi va mat khau moi dung cho CRUD/BVA cua user management.
    email: "sysadmin_test@s2o.com",
    fullName: "Admin Test User",
    password: "Admin@Test123",
    newPassword: "Admin@New456",
  },
};
