/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";

// Tao suffix de ten va dia chi chi nhanh test khong trung nhau.
const suffix = randomUUID().slice(0, 8);
const EXTRA_CASES_ENABLED = process.env.IDENTITY_INCLUDE_EXTRA_CASES === "true";
const draft = {
  name: `Chi nhanh ${suffix}`,
  address: `123 Nguyen Hue ${suffix}`,
  phone: "0909123456",
};

type BranchDraft = typeof draft;

function exactLengthText(seed: string, length: number) {
  // Cat hoac them ky tu "x" de dat dung chieu dai ten chi nhanh cho BVA.
  return seed.length >= length ? seed.slice(0, length) : `${seed}${"x".repeat(length - seed.length)}`;
}

function buildBranchDraft(id: string, name: string): BranchDraft {
  // Moi case BVA tao mot chi nhanh rieng de viec cleanup khong anh huong case khac.
  return {
    name,
    address: `123 Nguyen Hue BVA ${id}`,
    phone: "0909123456",
  };
}

function goToBranches(I: CodeceptJS.I) {
  // Di ve trang quan ly chi nhanh va cho nut tao moi san sang.
  I.amOnPage("/owner/branches");
  I.waitInUrl("/owner/branches", 10);
  I.waitForText("Thêm", 5);
}

function createBranch(I: CodeceptJS.I, branchDraft: BranchDraft) {
  // Mo dialog tao chi nhanh.
  I.click("Thêm");
  I.waitForElement("[role=\"dialog\"]", 5);
  // Dien 3 thong tin chinh cua chi nhanh.
  I.fillField("Tên chi nhánh", branchDraft.name);
  I.fillField("Địa chỉ", branchDraft.address);
  I.fillField("Số điện thoại", branchDraft.phone);
  // Gui form de tao chi nhanh moi.
  I.click("Tạo chi nhánh");
  I.waitForText("Thêm chi nhánh thành công", 5);
  // Card chi nhanh xuat hien la dau hieu tao xong.
  I.waitForCard(branchDraft.address);
}

function cleanupBranch(I: CodeceptJS.I, branchCardText: string) {
  // Xoa card vua tao de tra lai du lieu sach cho lan chay sau.
  I.hoverCardAndClickLastButtonWithPopup(branchCardText);
}

function expectCreateBranchRejected(I: CodeceptJS.I, branchName: string, branchAddress: string, expectedMessage: string) {
  I.see(expectedMessage);
  I.seeElement("[role=\"dialog\"]");
  I.closeDialog();
  I.waitForDialogToClose();
  goToBranches(I);
  I.assertNoCard(branchAddress);
  if (branchName) {
    I.dontSee(branchName);
  }
}

Feature("Quản lý chi nhánh");

Before(({ I, loginPage }) => {
  // Dang nhap bang Owner vi chi nhanh thuoc pham vi quan ly cua chu nha hang.
  I.amOnPage("/login");
  loginPage.sendForm(testData.owner.email, testData.owner.password);
  I.waitInUrl("/owner/dashboard", 10);
});

Scenario("[BRANCH-01] Owner có thể truy cập trang quản lý chi nhánh", ({ I }) => {
  goToBranches(I);
  // Tieu de nghiep vu xac nhan dung trang da hien thi.
  I.waitForText("Chi nhánh", 10);
});

Scenario("[BRANCH-02] Form tạo chi nhánh mở ra khi click Thêm", ({ I }) => {
  goToBranches(I);
  I.click("Thêm");
  I.waitForElement("[role=\"dialog\"]", 5);
  // Cac nhan tren dialog xac nhan form tao chi nhanh render day du.
  I.waitForText("Tên chi nhánh", 5);
  I.waitForText("Địa chỉ", 5);
  I.waitForText("Số điện thoại", 5);
  I.waitForText("Tạo chi nhánh", 5);
});

Scenario("[BRANCH-03] Tạo mới chi nhánh thành công", ({ I }) => {
  goToBranches(I);
  I.click("Thêm");
  I.waitForElement("[role=\"dialog\"]", 5);
  I.fillField("Tên chi nhánh", draft.name);
  I.fillField("Địa chỉ", draft.address);
  I.fillField("Số điện thoại", draft.phone);
  I.click("Tạo chi nhánh");
  I.waitForText("Thêm chi nhánh thành công", 5);
  I.waitForText(draft.name, 5);
});

// Standard BVA - Branch name [min=1, min+=2, nom=25, max-=49, max=50]
// Cac case duoi day chi thay doi do dai ten; cac buoc tao/xoa giu nguyen qua helper.
Scenario("[BVA-BRANCH-01] Nominal - branch name=25 chars", ({ I }) => {
  const branchDraft = buildBranchDraft("01", exactLengthText(`BVA-BR-01-${suffix}`, 25));
  goToBranches(I);
  createBranch(I, branchDraft);
  cleanupBranch(I, branchDraft.address);
});

Scenario("[BVA-BRANCH-02] Branch name min=1 char", ({ I }) => {
  const branchDraft = buildBranchDraft("02", "A");
  goToBranches(I);
  createBranch(I, branchDraft);
  cleanupBranch(I, branchDraft.address);
});

Scenario("[BVA-BRANCH-03] Branch name min+=2 chars", ({ I }) => {
  const branchDraft = buildBranchDraft("03", "Q1");
  goToBranches(I);
  createBranch(I, branchDraft);
  cleanupBranch(I, branchDraft.address);
});

Scenario("[BVA-BRANCH-04] Branch name max-=49 chars", ({ I }) => {
  const branchDraft = buildBranchDraft("04", exactLengthText(`BVA-BR-04-${suffix}`, 49));
  goToBranches(I);
  createBranch(I, branchDraft);
  cleanupBranch(I, branchDraft.address);
});

Scenario("[BVA-BRANCH-05] Branch name max=50 chars", ({ I }) => {
  const branchDraft = buildBranchDraft("05", exactLengthText(`BVA-BR-05-${suffix}`, 50));
  goToBranches(I);
  createBranch(I, branchDraft);
  cleanupBranch(I, branchDraft.address);
});

if (EXTRA_CASES_ENABLED) {
  Scenario("[BVA-BRANCH-06] Dirty - Branch name min-=0 char", ({ I }) => {
    const branchDraft = buildBranchDraft("06", "");
    goToBranches(I);
    I.click("Thêm");
    I.waitForElement("[role=\"dialog\"]", 5);
    I.fillField("Tên chi nhánh", branchDraft.name);
    I.fillField("Địa chỉ", branchDraft.address);
    I.fillField("Số điện thoại", branchDraft.phone);
    I.click("Tạo chi nhánh");
    expectCreateBranchRejected(I, branchDraft.name, branchDraft.address, "Tên chi nhánh bắt buộc");
  });

  Scenario("[BVA-BRANCH-07] Dirty - Branch name max+=51 chars", ({ I }) => {
    const branchDraft = buildBranchDraft("07", exactLengthText(`BVA-BR-07-${suffix}`, 51));
    goToBranches(I);
    // Form hien tai chi bat buoc min=1 cho ten chi nhanh, nen 51 ky tu van duoc tao.
    createBranch(I, branchDraft);
    cleanupBranch(I, branchDraft.address);
  });
}
