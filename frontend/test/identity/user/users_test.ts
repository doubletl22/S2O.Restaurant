/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";

const suffix = randomUUID().slice(0, 8);
const [emailLocalPart, emailDomain = "s2o.test"] = testData.newUser.email.split("@");
const draft = {
  email: `${emailLocalPart}_${suffix}@${emailDomain}`,
  fullName: `${testData.newUser.fullName} ${suffix}`,
  password: testData.newUser.password,
};

type AdminDraft = typeof draft;

function exactLengthText(seed: string, length: number) {
  return seed.length >= length ? seed.slice(0, length) : `${seed}${"x".repeat(length - seed.length)}`;
}

function buildAdminDraft(id: string, fullName: string, password: string): AdminDraft {
  return {
    email: `${emailLocalPart}_bva_${id}_${suffix}@${emailDomain}`,
    fullName,
    password,
  };
}

function goToUsers(I: CodeceptJS.I) {
  I.amOnPage("/sysadmin/users");
  I.waitInUrl("/sysadmin/users", 10);
}

function openCreateAdminDialog(I: CodeceptJS.I) {
  I.usePlaywrightTo("mở dialog thêm admin", async ({ page }) => {
    const createButton = page.getByRole("button", { name: "Thêm Admin" });
    const dialog = page.getByRole("dialog");

    await createButton.waitFor({ state: "visible", timeout: 10000 });

    for (let attempt = 0; attempt < 3; attempt += 1) {
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
  I.click("Tạo tài khoản");
}

function createAdmin(I: CodeceptJS.I, adminDraft: AdminDraft) {
  openCreateAdminDialog(I);
  I.fillVisibleDialogInputs([adminDraft.email, adminDraft.fullName, adminDraft.password]);
  submitCreateAdmin(I);
  I.waitForDialogToClose();
}

function verifyAdminCreated(I: CodeceptJS.I, email: string) {
  I.fillField('[placeholder="Tìm user..."]', email);
  I.waitForTableRow(email);
}

function cleanupAdmin(I: CodeceptJS.I, email: string) {
  I.fillField('[placeholder="Tìm user..."]', email);
  I.waitForTableRow(email);
  I.clickTableRowActionAndAcceptPopup(email, 2);
  I.assertNoTableRow(email);
}

function openResetPasswordDialog(I: CodeceptJS.I, email: string) {
  I.fillField('[placeholder="Tìm user..."]', email);
  I.waitForTableRow(email);
  I.clickTableRowAction(email, 0);
  I.waitForElement('[role="dialog"]', 10);
}

function submitResetPassword(I: CodeceptJS.I) {
  I.click("Xác nhận");
}

function resetAdminPassword(I: CodeceptJS.I, email: string, newPassword: string) {
  openResetPasswordDialog(I, email);
  I.fillVisibleDialogInputs([newPassword]);
  submitResetPassword(I);
  I.waitForDialogToClose();
}

function expectCreateAdminRejected(I: CodeceptJS.I, email: string) {
  I.waitForText("Tạo thất bại", 10);
  I.seeElement('[role="dialog"]');
  I.closeDialog();
  I.waitForDialogToClose();
  goToUsers(I);
  I.fillField('[placeholder="Tìm user..."]', email);
  I.assertNoTableRow(email);
}

function expectResetPasswordRejected(I: CodeceptJS.I) {
  I.waitForText("Đổi mật khẩu thất bại", 10);
  I.seeElement('[role="dialog"]');
  I.closeDialog();
  I.waitForDialogToClose();
}

function loginAs(I: CodeceptJS.I, loginPage: any, email: string, password: string) {
  I.amOnPage("/login");
  loginPage.sendForm(email, password);
  I.waitInUrl("/dashboard", 10);
}

Feature("Quản lý người dùng");

Before(({ I, loginPage }) => {
  I.amOnPage("/login");
  loginPage.sendForm(testData.admin.email, testData.admin.password);
  I.waitInUrl("/dashboard", 10);
});

Scenario("[USER-01] System Admin có thể truy cập trang quản lý người dùng", ({ I }) => {
  goToUsers(I);
  I.waitForElement("table", 10);
});

Scenario("[USER-02] Tạo mới tài khoản System Admin", ({ I }) => {
  goToUsers(I);
  createAdmin(I, draft);
  verifyAdminCreated(I, draft.email);
});

Scenario("[USER-03] Xem lại thông tin và hành động của tài khoản admin đã tạo", ({ I }) => {
  goToUsers(I);
  I.fillField('[placeholder="Tìm user..."]', draft.email);
  I.waitForTableRow(draft.email);
  I.clickTableRowAction(draft.email, 0);
  I.waitForElement('[role="dialog"]', 10);
  I.see(draft.email);
  I.closeDialog();
  I.waitForDialogToClose();
});

Scenario("[USER-05] Đổi mật khẩu tài khoản admin", ({ I }) => {
  goToUsers(I);
  resetAdminPassword(I, draft.email, testData.newUser.newPassword);
});

Scenario("[USER-06] Khóa tài khoản admin", ({ I }) => {
  goToUsers(I);
  I.fillField('[placeholder="Tìm user..."]', draft.email);
  I.waitForTableRow(draft.email);
  I.clickTableRowActionAndAcceptPopup(draft.email, 1);
  I.waitForTableRowStatus(draft.email, "Locked");
});

Scenario("[USER-07] Mở khóa tài khoản admin đã bị khóa", ({ I }) => {
  goToUsers(I);
  I.fillField('[placeholder="Tìm user..."]', draft.email);
  I.waitForTableRow(draft.email);
  I.clickTableRowActionAndAcceptPopup(draft.email, 1);
  I.waitForTableRowStatus(draft.email, "Active");
});

Scenario("[USER-04] Xóa tài khoản admin", ({ I }) => {
  goToUsers(I);
  cleanupAdmin(I, draft.email);
});

// Standard BVA - Full name [min=1, min+=2, nom=25, max-=49, max=50]
// Standard BVA - Password [min=6, min+=7, nom=28, max-=49, max=50]
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
Scenario("[BVA-USER-10] Dirty - full name min-=0 chars, password=nom=28", ({ I }) => {
  const adminDraft = buildAdminDraft("10", "", exactLengthText(`Abc@BVA-USER-10-${suffix}`, 28));
  goToUsers(I);
  openCreateAdminDialog(I);
  I.fillVisibleDialogInputs([adminDraft.email, adminDraft.fullName, adminDraft.password]);
  submitCreateAdmin(I);
  expectCreateAdminRejected(I, adminDraft.email);
});

Scenario("[BVA-USER-11] Dirty - full name max+=51 chars, password=nom=28", ({ I }) => {
  const adminDraft = buildAdminDraft(
    "11",
    exactLengthText(`BVA-USER-11-${suffix}`, 51),
    exactLengthText(`Abc@BVA-USER-11-${suffix}`, 28)
  );
  goToUsers(I);
  openCreateAdminDialog(I);
  I.fillVisibleDialogInputs([adminDraft.email, adminDraft.fullName, adminDraft.password]);
  submitCreateAdmin(I);
  expectCreateAdminRejected(I, adminDraft.email);
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
  openCreateAdminDialog(I);
  I.fillVisibleDialogInputs([adminDraft.email, adminDraft.fullName, adminDraft.password]);
  submitCreateAdmin(I);
  expectCreateAdminRejected(I, adminDraft.email);
});

// Standard BVA - Reset password [min=6, min+=7, nom=28, max-=49, max=50]
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
  loginAs(I, loginPage, adminDraft.email, adminDraft.password);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});

Scenario("[BVA-USER-20] Dirty - reset password max+=51 chars", ({ I, loginPage }) => {
  const adminDraft = buildAdminDraft("20", exactLengthText(`BVA-USER-20-${suffix}`, 25), testData.newUser.password);
  const invalidPassword = exactLengthText(`Abc@BVA-USER-20-${suffix}`, 51);
  goToUsers(I);
  createAdmin(I, adminDraft);
  verifyAdminCreated(I, adminDraft.email);
  openResetPasswordDialog(I, adminDraft.email);
  I.fillVisibleDialogInputs([invalidPassword]);
  submitResetPassword(I);
  expectResetPasswordRejected(I);
  loginAs(I, loginPage, adminDraft.email, adminDraft.password);
  loginAs(I, loginPage, testData.admin.email, testData.admin.password);
  goToUsers(I);
  cleanupAdmin(I, adminDraft.email);
});
