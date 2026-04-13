/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";

const suffix = randomUUID().slice(0, 8);
const draft = {
  name: `Chi nhanh ${suffix}`,
  address: `123 Nguyen Hue ${suffix}`,
  phone: "0909123456",
};

type BranchDraft = typeof draft;

function exactLengthText(seed: string, length: number) {
  return seed.length >= length ? seed.slice(0, length) : `${seed}${"x".repeat(length - seed.length)}`;
}

function buildBranchDraft(id: string, name: string): BranchDraft {
  return {
    name,
    address: `123 Nguyen Hue BVA ${id}`,
    phone: "0909123456",
  };
}

function goToBranches(I: CodeceptJS.I) {
  I.amOnPage("/owner/branches");
  I.waitInUrl("/owner/branches", 10);
  I.waitForText("Thêm", 5);
}

function createBranch(I: CodeceptJS.I, branchDraft: BranchDraft) {
  I.click("Thêm");
  I.waitForElement('[role="dialog"]', 5);
  I.fillField("Tên chi nhánh", branchDraft.name);
  I.fillField("Địa chỉ", branchDraft.address);
  I.fillField("Số điện thoại", branchDraft.phone);
  I.click("Tạo chi nhánh");
  I.waitForText("Thêm chi nhánh thành công", 5);
  I.waitForCard(branchDraft.address);
}

function cleanupBranch(I: CodeceptJS.I, branchCardText: string) {
  I.hoverCardAndClickLastButtonWithPopup(branchCardText);
}

Feature("Quản lý chi nhánh");

Before(({ I, loginPage }) => {
  I.amOnPage("/login");
  loginPage.sendForm(testData.owner.email, testData.owner.password);
  I.waitInUrl("/owner/dashboard", 10);
});

Scenario("[BRANCH-01] Owner có thể truy cập trang quản lý chi nhánh", ({ I }) => {
  goToBranches(I);
  I.waitForText("Chi nhánh", 10);
});

Scenario("[BRANCH-02] Form tạo chi nhánh mở ra khi click Thêm", ({ I }) => {
  goToBranches(I);
  I.click("Thêm");
  I.waitForElement('[role="dialog"]', 5);
  I.waitForText("Tên chi nhánh", 5);
  I.waitForText("Địa chỉ", 5);
  I.waitForText("Số điện thoại", 5);
  I.waitForText("Tạo chi nhánh", 5);
});

Scenario("[BRANCH-03] Tạo mới chi nhánh thành công", ({ I }) => {
  goToBranches(I);
  I.click("Thêm");
  I.waitForElement('[role="dialog"]', 5);
  I.fillField("Tên chi nhánh", draft.name);
  I.fillField("Địa chỉ", draft.address);
  I.fillField("Số điện thoại", draft.phone);
  I.click("Tạo chi nhánh");
  I.waitForText("Thêm chi nhánh thành công", 5);
  I.waitForText(draft.name, 5);
});

// Standard BVA - Branch name [min=1, min+=2, nom=25, max-=49, max=50]
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
