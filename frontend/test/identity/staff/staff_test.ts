/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";

const suffix = randomUUID().slice(0, 8);
const draft = {
  email: `staff_${suffix}@s2o.test`,
  fullName: `Nhan Vien ${suffix}`,
  password: "Staff@123",
  phoneNumber: "0901234567",
  updatedName: `Nhan Vien Sua ${suffix}`,
};

type StaffDraft = typeof draft;

const STAFF_NOMINAL_PASSWORD = "Staff@123";

function exactLengthText(seed: string, length: number) {
  return seed.length >= length ? seed.slice(0, length) : `${seed}${"x".repeat(length - seed.length)}`;
}

function exactLengthDigits(seed: string, length: number) {
  const digitsOnly = seed.replace(/\D/g, "");
  return digitsOnly.length >= length
    ? digitsOnly.slice(0, length)
    : `${digitsOnly}${"0".repeat(length - digitsOnly.length)}`;
}

function buildStaffDraft(id: string, fullName: string, phoneNumber: string): StaffDraft {
  return {
    email: `staff_bva_${id}_${suffix}@s2o.test`,
    fullName,
    password: STAFF_NOMINAL_PASSWORD,
    phoneNumber,
    updatedName: `Nhan Vien Sua BVA ${id} ${suffix}`,
  };
}

function goToStaff(I: CodeceptJS.I) {
  I.amOnPage("/owner/staff");
  I.waitInUrl("/owner/staff", 10);
}

function createStaff(I: CodeceptJS.I, staffDraft: StaffDraft) {
  I.click("Thêm nhân viên");
  I.waitForElement('[role="dialog"]', 15);
  I.fillField('input[name="email"]', staffDraft.email);
  I.fillField('input[name="password"]', staffDraft.password);
  I.fillField('input[name="name"]', staffDraft.fullName);
  I.fillField('input[name="phoneNumber"]', staffDraft.phoneNumber);

  I.usePlaywrightTo("chọn chi nhánh đầu tiên cho staff bva", async ({ page }) => {
    const branchSelect = page.getByRole("dialog").getByRole("combobox").nth(1);
    await branchSelect.click();
    await page.getByRole("option").first().click();
  });

  I.click("Lưu thay đổi");
  I.waitForDialogToClose();
  I.waitForCard(staffDraft.email);
}

function cleanupStaff(I: CodeceptJS.I, cardText: string) {
  I.hoverCardAndClickLastButtonWithPopup(cardText);
  I.assertNoCard(cardText);
}

Feature("Quản lý nhân viên");

Before(({ I, loginPage }) => {
  I.amOnPage("/login");
  loginPage.sendForm(testData.owner.email, testData.owner.password);
  I.waitInUrl("/owner/dashboard", 10);
});

Scenario("[STAFF-01] Owner có thể truy cập trang quản lý nhân viên", ({ I }) => {
  goToStaff(I);
  I.waitForText("Thêm nhân viên", 10);
});

Scenario("[STAFF-02] Tạo mới tài khoản nhân viên", ({ I }) => {
  goToStaff(I);
  createStaff(I, draft);
});

Scenario("[STAFF-03] Cập nhật thông tin tài khoản nhân viên", ({ I }) => {
  goToStaff(I);
  I.hoverCardAndClick(draft.fullName, /Sửa/i);
  I.waitForElement('[role="dialog"]', 10);

  I.usePlaywrightTo("nhập tên mới cho nhân viên", async ({ page }) => {
    const editInputs = page.getByRole("dialog").locator("input:not([disabled])");
    await editInputs.nth(0).fill(draft.updatedName);
    await editInputs.nth(1).fill(draft.phoneNumber);
  });

  I.click("Lưu thay đổi");
  I.waitForDialogToClose();
  I.waitForCard(draft.updatedName);
});

Scenario("[STAFF-05] Lọc nhân viên theo chi nhánh", ({ I }) => {
  goToStaff(I);

  I.usePlaywrightTo("chọn chi nhánh đầu tiên để lọc", async ({ page }) => {
    const filterSelect = page.getByRole("combobox").first();
    await filterSelect.click();
    await page.getByRole("option").nth(1).click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.waitForTimeout(1000);
  });

  I.waitForCard(draft.updatedName);

  I.usePlaywrightTo("reset lọc về tất cả chi nhánh", async ({ page }) => {
    const filterSelect = page.getByRole("combobox").first();
    await filterSelect.click();
    await page.getByRole("option").first().click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.waitForTimeout(500);
  });

  I.waitForCard(draft.updatedName);
});

Scenario("[STAFF-04] Xóa tài khoản nhân viên", ({ I }) => {
  goToStaff(I);
  I.hoverCardAndClickLastButtonWithPopup(draft.updatedName);

  I.usePlaywrightTo("chờ card biến mất", async ({ page }) => {
    await page
      .locator(".group")
      .filter({ hasText: draft.updatedName })
      .first()
      .waitFor({ state: "hidden", timeout: 10000 });
  });

  I.assertNoCard(draft.updatedName);
});

// Standard BVA - Name [min=1, min+=2, nom=25, max-=49, max=50]
// Standard BVA - Phone [min=9, min+=10, nom=10, max-=10, max=11]
Scenario("[BVA-STAFF-01] Nominal - name=25 chars, phone=10 chars", ({ I }) => {
  const staffDraft = buildStaffDraft(
    "01",
    exactLengthText(`BVA-STAFF-01-${suffix}`, 25),
    exactLengthDigits(`0901234501${suffix}`, 10)
  );
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});

Scenario("[BVA-STAFF-02] Name min=1 char, phone=nom=10", ({ I }) => {
  const staffDraft = buildStaffDraft("02", "A", exactLengthDigits(`0901234502${suffix}`, 10));
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});

Scenario("[BVA-STAFF-03] Name min+=2 chars, phone=nom=10", ({ I }) => {
  const staffDraft = buildStaffDraft("03", "AB", exactLengthDigits(`0901234503${suffix}`, 10));
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});

Scenario("[BVA-STAFF-04] Name max-=49 chars, phone=nom=10", ({ I }) => {
  const staffDraft = buildStaffDraft(
    "04",
    exactLengthText(`BVA-STAFF-04-${suffix}`, 49),
    exactLengthDigits(`0901234504${suffix}`, 10)
  );
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});

Scenario("[BVA-STAFF-05] Name max=50 chars, phone=nom=10", ({ I }) => {
  const staffDraft = buildStaffDraft(
    "05",
    exactLengthText(`BVA-STAFF-05-${suffix}`, 50),
    exactLengthDigits(`0901234505${suffix}`, 10)
  );
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});

Scenario("[BVA-STAFF-06] Phone min=9 chars, name=nom=25", ({ I }) => {
  const staffDraft = buildStaffDraft(
    "06",
    exactLengthText(`BVA-STAFF-06-${suffix}`, 25),
    exactLengthDigits(`090123406${suffix}`, 9)
  );
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});

Scenario("[BVA-STAFF-07] Phone min+=10 chars, name=nom=25", ({ I }) => {
  const staffDraft = buildStaffDraft(
    "07",
    exactLengthText(`BVA-STAFF-07-${suffix}`, 25),
    exactLengthDigits(`0901234507${suffix}`, 10)
  );
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});

Scenario("[BVA-STAFF-08] Phone max-=10 chars, name=nom=25", ({ I }) => {
  const staffDraft = buildStaffDraft(
    "08",
    exactLengthText(`BVA-STAFF-08-${suffix}`, 25),
    exactLengthDigits(`0901234508${suffix}`, 10)
  );
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});

Scenario("[BVA-STAFF-09] Phone max=11 chars, name=nom=25", ({ I }) => {
  const staffDraft = buildStaffDraft(
    "09",
    exactLengthText(`BVA-STAFF-09-${suffix}`, 25),
    exactLengthDigits(`09012345090${suffix}`, 11)
  );
  goToStaff(I);
  createStaff(I, staffDraft);
  cleanupStaff(I, staffDraft.email);
});
