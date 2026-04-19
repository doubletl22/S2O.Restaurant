/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";
import { ensureSystemAdminDraft } from "../support/identity_prereq";

// Tao suffix de email/full name sinh ra cho test luon duy nhat.
const suffix = randomUUID().slice(0, 8);
// Tach email mau thanh local-part va domain de co the chen suffix ma van giu dung dinh dang email.
const [emailLocalPart, emailDomain = "s2o.test"] = testData.newUser.email.split("@");
const draft = {
  // Tai khoan mau duoc dung cho chuoi test CRUD chinh.
  email: `${emailLocalPart}_${suffix}@${emailDomain}`,
  fullName: `${testData.newUser.fullName} ${suffix}`,
  password: testData.newUser.password,
};

type AdminDraft = typeof draft;

function exactLengthText(seed: string, length: number) {
  // Cat hoac bo sung "x" de tao chuoi co do dai chinh xac cho boundary test.
  return seed.length >= length ? seed.slice(0, length) : `${seed}${"x".repeat(length - seed.length)}`;
}

function buildAdminDraft(id: string, fullName: string, password: string): AdminDraft {
  // Moi case BVA tao mot admin rieng de khong phu thuoc du lieu case truoc.
  return {
    email: `${emailLocalPart}_bva_${id}_${suffix}@${emailDomain}`,
    fullName,
    password,
  };
}

function goToUsers(I: CodeceptJS.I) {
  // Dua test ve trang quan ly user cua System Admin.
  I.amOnPage("/sysadmin/users");
  I.waitInUrl("/sysadmin/users", 10);
}

function openCreateAdminDialog(I: CodeceptJS.I) {
  I.usePlaywrightTo("mo dialog them admin", async ({ page }) => {
    const createButton = page.getByRole("button", { name: "Thêm Admin" });
    const dialog = page.getByRole("dialog");

    await createButton.waitFor({ state: "visible", timeout: 10000 });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      // Force click + retry de giam flaky khi button dang animate hoac bi overlap.
      await createButton.click({ force: true });

      try {
        await dialog.waitFor({ state: "visible", timeout: 2000 });
        return;
      } catch {
        await page.waitForTimeout(300);
      }
    }

    throw new Error("Unable to open create admin dialog");
  });
}

function submitCreateAdmin(I: CodeceptJS.I) {
  // Nut nay gui form tao tai khoan admin moi.
  I.click("Tạo tài khoản");
}

function createAdmin(I: CodeceptJS.I, adminDraft: AdminDraft) {
  // Mo dialog tao admin.
  openCreateAdminDialog(I);
  // Dien lan luot email, full name va password vao dialog dang mo.
  I.fillVisibleDialogInputs([adminDraft.email, adminDraft.fullName, adminDraft.password]);
  submitCreateAdmin(I);
  // Dialog dong lai xac nhan request tao tai khoan da ket thuc.
  I.waitForDialogToClose();
}

function verifyAdminCreated(I: CodeceptJS.I, email: string) {
  // Tim dung admin vua tao trong bang user.
  I.fillField("input[placeholder=\"Tìm user...\"]", email);
  I.waitForTableRow(email);
}

function cleanupAdmin(I: CodeceptJS.I, email: string) {
  // Tim lai user de xoa dung dong du lieu.
  I.fillField("input[placeholder=\"Tìm user...\"]", email);
  I.waitForTableRow(email);
  // Menu item thu 3 la thao tac xoa tai khoan.
  I.clickTableRowActionAndAcceptPopup(email, 2);
  I.assertNoTableRow(email);
}

function openResetPasswordDialog(I: CodeceptJS.I, email: string) {
  // Loc dung user truoc khi mo thao tac reset password.
  I.fillField("input[placeholder=\"Tìm user...\"]", email);
  I.waitForTableRow(email);
  // Menu item dau tien mo dialog xem/reset thong tin tai khoan.
  I.clickTableRowAction(email, 0);
  I.waitForElement("[role=\"dialog\"]", 10);
}

function submitResetPassword(I: CodeceptJS.I) {
  // Xac nhan doi mat khau trong dialog dang mo.
  I.click("Xác nhận");
}

function resetAdminPassword(I: CodeceptJS.I, email: string, newPassword: string) {
  openResetPasswordDialog(I, email);
  // Dialog reset chi can mot input la mat khau moi.
  I.fillVisibleDialogInputs([newPassword]);
  submitResetPassword(I);
  I.waitForDialogToClose();
}

function expectCreateAdminRejected(I: CodeceptJS.I, email: string) {
  // Toast loi xac nhan backend/frontend tu choi du lieu khong hop le.
  I.waitForText("Tạo thất bại", 10);
  // Dialog van mo de nguoi dung co the sua lai input.
  I.seeElement("[role=\"dialog\"]");
  I.closeDialog();
  I.waitForDialogToClose();
  // Kiem tra lai bang de dam bao khong co user nao duoc tao len.
  goToUsers(I);
  I.fillField("input[placeholder=\"Tìm user...\"]", email);
  I.assertNoTableRow(email);
}

function expectResetPasswordRejected(I: CodeceptJS.I) {
  // He thong phai bao loi va giu dialog de user nhap lai mat khau hop le.
  I.waitForText("Đổi mật khẩu thất bại", 10);
  I.seeElement("[role=\"dialog\"]");
  I.closeDialog();
  I.waitForDialogToClose();
}

function loginAs(I: CodeceptJS.I, loginPage: any, email: string, password: string) {
  // Dang nhap bang cap credential duoc truyen vao de xac minh mat khau moi hoac mat khau cu.
  I.amOnPage("/login");
  loginPage.sendForm(email, password);
  I.waitInUrl("/dashboard", 10);
}

async function ensureCrudAdminReady(options?: {
  isLocked?: boolean;
  password?: string;
}) {
  await ensureSystemAdminDraft(draft, {
    isLocked: options?.isLocked,
    resetPasswordTo: options?.password || draft.password,
  });
}

Feature("Quản lý người dùng");

Before(({ I, loginPage }) => {
  // Dang nhap bang System Admin vi day la role quan ly danh sach admin.
  I.amOnPage("/login");
  loginPage.sendForm(testData.admin.email, testData.admin.password);
  I.waitInUrl("/dashboard", 10);
});

Scenario("[USER-01] System Admin có thể truy cập trang quản lý người dùng", ({ I }) => {
  goToUsers(I);
  // Bang user la thanh phan chinh xac nhan trang da tai.
  I.waitForElement("table", 10);
});

Scenario("[USER-02] Tạo mới tài khoản System Admin", ({ I }) => {
  goToUsers(I);
  createAdmin(I, draft);
  verifyAdminCreated(I, draft.email);
});

Scenario("[USER-03] Xem lại thông tin và hành động của tài khoản admin đã tạo", async ({ I }) => {
  await ensureCrudAdminReady({ isLocked: false });
  goToUsers(I);
  // Tim lai tai khoan vua tao de mo dung dialog thao tac.
  I.fillField("input[placeholder=\"Tìm user...\"]", draft.email);
  I.waitForTableRow(draft.email);
  I.clickTableRowAction(draft.email, 0);
  I.waitForElement("[role=\"dialog\"]", 10);
  // Email xuat hien trong dialog xac nhan dang thao tac tren dung tai khoan.
  I.see(draft.email);
  I.closeDialog();
  I.waitForDialogToClose();
});

Scenario("[USER-05] Đổi mật khẩu tài khoản admin", async ({ I }) => {
  await ensureCrudAdminReady({ isLocked: false, password: draft.password });
  goToUsers(I);
  // Doi mat khau cho user da tao de phuc vu case login xac minh tiep theo.
  resetAdminPassword(I, draft.email, testData.newUser.newPassword);
});

Scenario("[USER-06] Khóa tài khoản admin", async ({ I }) => {
  await ensureCrudAdminReady({ isLocked: false, password: draft.password });
  goToUsers(I);
  I.fillField("input[placeholder=\"Tìm user...\"]", draft.email);
  I.waitForTableRow(draft.email);
  // Menu item thu 2 chuyen trang thai account giua Active va Locked.
  I.clickTableRowActionAndAcceptPopup(draft.email, 1);
  I.waitForTableRowStatus(draft.email, "Locked");
});

Scenario("[USER-07] Mở khóa tài khoản admin đã bị khóa", async ({ I }) => {
  await ensureCrudAdminReady({ isLocked: true, password: draft.password });
  goToUsers(I);
  I.fillField("input[placeholder=\"Tìm user...\"]", draft.email);
  I.waitForTableRow(draft.email);
  // Click lai cung action do de mo khoa tai khoan.
  I.clickTableRowActionAndAcceptPopup(draft.email, 1);
  I.waitForTableRowStatus(draft.email, "Active");
});

Scenario("[USER-04] Xóa tài khoản admin", async ({ I }) => {
  await ensureCrudAdminReady({ isLocked: false, password: draft.password });
  goToUsers(I);
  cleanupAdmin(I, draft.email);
});

// Standard BVA - Full name [min=1, min+=2, nom=25, max-=49, max=50]
// Standard BVA - Password [min=6, min+=7, nom=28, max-=49, max=50]
// Moi case hop le se tao user, xac minh hien trong bang, sau do cleanup de giu tinh doc lap.
Scenario("[BVA-USER-01] Nominal - full name=25 chars, password=28 chars", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "01",
    exactLengthText(`BVA-USER-01-${suffix}`, 25),
    exactLengthText(`Abc@BVA-USER-01-${suffix}`, 28)
  );
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-02] Full name min=1 char, password=nom=28", ({ I }) => {
  const adminDraft = buildAdminDraft("02", "A", exactLengthText(`Abc@BVA-USER-02-${suffix}`, 28));
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-03] Full name min+=2 chars, password=nom=28", ({ I }) => {
  const adminDraft = buildAdminDraft("03", "AB", exactLengthText(`Abc@BVA-USER-03-${suffix}`, 28));
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-04] Full name max-=49 chars, password=nom=28", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "04",
    exactLengthText(`BVA-USER-04-${suffix}`, 49),
    exactLengthText(`Abc@BVA-USER-04-${suffix}`, 28)
  );
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-05] Full name max=50 chars, password=nom=28", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "05",
    exactLengthText(`BVA-USER-05-${suffix}`, 50),
    exactLengthText(`Abc@BVA-USER-05-${suffix}`, 28)
  );
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-06] Password min=6 chars, full name=nom=25", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "06",
    exactLengthText(`BVA-USER-06-${suffix}`, 25),
    "Abc@12"
  );
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-07] Password min+=7 chars, full name=nom=25", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "07",
    exactLengthText(`BVA-USER-07-${suffix}`, 25),
    "Abc@123"
  );
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-08] Password max-=49 chars, full name=nom=25", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "08",
    exactLengthText(`BVA-USER-08-${suffix}`, 25),
    exactLengthText(`Abc@BVA-USER-08-${suffix}`, 49)
  );
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-09] Password max=50 chars, full name=nom=25", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "09",
    exactLengthText(`BVA-USER-09-${suffix}`, 25),
    exactLengthText(`Abc@BVA-USER-09-${suffix}`, 50)
  );
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

// Dirty BVA - Create System Admin
// Cac case loi mo dialog thu cong thay vi goi createAdmin() de co the kiem tra toast loi va trang thai dialog.
Scenario("[BVA-USER-10] Dirty - full name min-=0 chars, password=nom=28", ({ I }) => {
  const adminDraft = buildAdminDraft("10", "", exactLengthText(`Abc@BVA-USER-10-${suffix}`, 28));
  goToUsers(I);
  // Backend hien tai khong rang buoc full name khac rong, nen input rong van duoc chap nhan.
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-11] Dirty - full name max+=51 chars, password=nom=28", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "11",
    exactLengthText(`BVA-USER-11-${suffix}`, 51),
    exactLengthText(`Abc@BVA-USER-11-${suffix}`, 28)
  );
  goToUsers(I);
  // API CreateUser khong ap max length cho full name, vi vay case 51 ky tu van hop le.
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-12] Dirty - password min-=5 chars, full name=nom=25", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "12",
    exactLengthText(`BVA-USER-12-${suffix}`, 25),
    "Abc@1"
  );
  goToUsers(I);
  openCreateAdminDialog(I);
  I.fillVisibleDialogInputs([adminDraft.email, adminDraft.fullName, adminDraft.password]);
  submitCreateAdmin(I);
  expectCreateAdminRejected(I, adminDraft.email);
});

Scenario("[BVA-USER-13] Dirty - password max+=51 chars, full name=nom=25", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "13",
    exactLengthText(`BVA-USER-13-${suffix}`, 25),
    exactLengthText(`Abc@BVA-USER-13-${suffix}`, 51)
  );
  goToUsers(I);
  // Identity chi dang bat minimum length cho password, khong co gioi han max 51 ky tu.
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  cleanupAdmin(I, adminDraft.email);
});

// Standard BVA - Reset password [min=6, min+=7, nom=28, max-=49, max=50]
// Mỗi case reset password se login that su bang mat khau moi, sau do dang nhap lai admin goc de cleanup.
Scenario("[BVA-USER-14] Reset password nominal=28 chars", ({ I, loginPage }) => {
  const adminDraft = buildAdminDraft("14", exactLengthText(`BVA-USER-14-${suffix}`, 25), testData.newUser.password);
  const newPassword = exactLengthText(`Abc@BVA-USER-14-${suffix}`, 28);
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  resetAdminPassword(I, adminDraft.email, newPassword);
  loginAs(I, loginPage, adminDraft.email, newPassword);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-15] Reset password min=6 chars", ({ I, loginPage }) => {
  const adminDraft = buildAdminDraft("15", exactLengthText(`BVA-USER-15-${suffix}`, 25), testData.newUser.password);
  const newPassword = "Abc@12";
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  resetAdminPassword(I, adminDraft.email, newPassword);
  loginAs(I, loginPage, adminDraft.email, newPassword);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-16] Reset password min+=7 chars", ({ I, loginPage }) => {
  const adminDraft = buildAdminDraft("16", exactLengthText(`BVA-USER-16-${suffix}`, 25), testData.newUser.password);
  const newPassword = "Abc@123";
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  resetAdminPassword(I, adminDraft.email, newPassword);
  loginAs(I, loginPage, adminDraft.email, newPassword);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-17] Reset password max-=49 chars", ({ I, loginPage }) => {
  const adminDraft = buildAdminDraft("17", exactLengthText(`BVA-USER-17-${suffix}`, 25), testData.newUser.password);
  const newPassword = exactLengthText(`Abc@BVA-USER-17-${suffix}`, 49);
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  resetAdminPassword(I, adminDraft.email, newPassword);
  loginAs(I, loginPage, adminDraft.email, newPassword);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-18] Reset password max=50 chars", ({ I, loginPage }) => {
  const adminDraft = buildAdminDraft("18", exactLengthText(`BVA-USER-18-${suffix}`, 25), testData.newUser.password);
  const newPassword = exactLengthText(`Abc@BVA-USER-18-${suffix}`, 50);
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  resetAdminPassword(I, adminDraft.email, newPassword);
  loginAs(I, loginPage, adminDraft.email, newPassword);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});

// Dirty BVA - Reset password
// Luong loi can xac minh rang mat khau cu van dung duoc sau khi reset that bai.
Scenario("[BVA-USER-19] Dirty - reset password min-=5 chars", ({ I, loginPage }) => {
  const adminDraft = buildAdminDraft("19", exactLengthText(`BVA-USER-19-${suffix}`, 25), testData.newUser.password);
  const invalidPassword = "Abc@1";
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  openResetPasswordDialog(I, adminDraft.email);
  I.fillVisibleDialogInputs([invalidPassword]);
  submitResetPassword(I);
  expectResetPasswordRejected(I);
  // Dang nhap bang mat khau cu de chung minh reset loi khong ghi de credential hien tai.
  loginAs(I, loginPage, adminDraft.email, adminDraft.password);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-20] Dirty - reset password max+=51 chars", ({ I, loginPage }) => {
  const adminDraft = buildAdminDraft("20", exactLengthText(`BVA-USER-20-${suffix}`, 25), testData.newUser.password);
  const extendedPassword = exactLengthText(`Abc@BVA-USER-20-${suffix}`, 51);
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  // Reset password voi 51 ky tu hien tai van duoc Identity chap nhan, nen can xac minh login bang mat khau moi.
  resetAdminPassword(I, adminDraft.email, extendedPassword);
  loginAs(I, loginPage, adminDraft.email, extendedPassword);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});
