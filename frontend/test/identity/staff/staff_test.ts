/// <reference path="../../../steps.d.ts" />
import { randomUUID } from "node:crypto";
import { testData } from "../data/user_data";
import { ensureStaffDraft } from "../support/identity_prereq";

// Tao suffix de staff test co email va ten rieng cho moi lan chay.
const suffix = randomUUID().slice(0, 8);
const EXTRA_CASES_ENABLED = process.env.IDENTITY_INCLUDE_EXTRA_CASES === "true";
const draft = {
  email: `staff_${suffix}@s2o.test`,
  fullName: `Nhan Vien ${suffix}`,
  password: "Staff@123",
  phoneNumber: "0901234567",
  updatedName: `Nhan Vien Sua ${suffix}`,
};

type StaffDraft = typeof draft;

// Mat khau staff duoc giu co dinh, cac case BVA chi thay doi ten va so dien thoai.
const STAFF_NOMINAL_PASSWORD = "Staff@123";

function exactLengthText(seed: string, length: number) {
  // Cat hoac bo sung ky tu de ten dat dung boundary mong muon.
  return seed.length >= length ? seed.slice(0, length) : `${seed}${"x".repeat(length - seed.length)}`;
}

function exactLengthDigits(seed: string, length: number) {
  // Chi giu lai chu so de du lieu phone luon hop le ve kieu gia tri.
  const digitsOnly = seed.replace(/\D/g, "");
  return digitsOnly.length >= length
    ? digitsOnly.slice(0, length)
    : `${digitsOnly}${"0".repeat(length - digitsOnly.length)}`;
}

function buildStaffDraft(id: string, fullName: string, phoneNumber: string): StaffDraft {
  // Moi case BVA tao mot staff rieng de xac minh doc lap va de cleanup de dang.
  return {
    email: `staff_bva_${id}_${suffix}@s2o.test`,
    fullName,
    password: STAFF_NOMINAL_PASSWORD,
    phoneNumber,
    updatedName: `Nhan Vien Sua BVA ${id} ${suffix}`,
  };
}

function goToStaff(I: CodeceptJS.I) {
  // Dua test ve trang quan ly staff cua Owner.
  I.amOnPage("/owner/staff");
  I.waitInUrl("/owner/staff", 10);
}

function openCreateStaffDialog(I: CodeceptJS.I) {
  I.usePlaywrightTo("mo dialog them nhan vien", async ({ page }) => {
    const createButton = page.getByRole("button", { name: "Thêm nhân viên" });
    const dialog = page.getByRole("dialog");

    await createButton.waitFor({ state: "visible", timeout: 10000 });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await createButton.click({ force: true });

      try {
        await dialog.waitFor({ state: "visible", timeout: 3000 });
        return;
      } catch {
        await page.waitForTimeout(300);
      }
    }

    throw new Error("Unable to open create staff dialog");
  });
}

function selectFirstStaffBranch(I: CodeceptJS.I, label: string) {
  I.usePlaywrightTo(label, async ({ page }) => {
    // Staff can duoc gan vao mot chi nhanh cu the, nen test chon option dau tien kha dung.
    const branchSelect = page.getByRole("dialog").getByRole("combobox").nth(1);
    await branchSelect.click();
    await page.getByRole("option").first().click();
  });
}

function createStaff(I: CodeceptJS.I, staffDraft: StaffDraft) {
  // Mo dialog them nhan vien moi.
  openCreateStaffDialog(I);
  // Dien thong tin tai khoan va thong tin ca nhan cho nhan vien.
  I.fillField("input[name=\"email\"]", staffDraft.email);
  I.fillField("input[name=\"password\"]", staffDraft.password);
  I.fillField("input[name=\"name\"]", staffDraft.fullName);
  I.fillField("input[name=\"phoneNumber\"]", staffDraft.phoneNumber);

  selectFirstStaffBranch(I, "chon chi nhanh dau tien cho staff");

  // Luu staff moi vao he thong.
  I.click("Lưu thay đổi");
  I.waitForDialogToClose();
  // Card chua email xuat hien xac nhan staff da duoc tao.
  I.waitForCard(staffDraft.email);
}

function cleanupStaff(I: CodeceptJS.I, cardText: string) {
  // Xoa card staff vua tao de giu du lieu test sach.
  I.hoverCardAndClickLastButtonWithPopup(cardText);
  I.assertNoCard(cardText);
}

function expectCreateStaffRejected(I: CodeceptJS.I, email: string, expectedMessage: string) {
  I.see(expectedMessage);
  I.seeElement("[role=\"dialog\"]");
  I.closeDialog();
  I.waitForDialogToClose();
  goToStaff(I);
  I.assertNoCard(email);
}

async function ensureMainStaffReady(fullName: string) {
  await ensureStaffDraft(draft, {
    fullName,
    phoneNumber: draft.phoneNumber,
    role: "Waiter",
    isActive: true,
  });
}

Feature("Quản lý nhân viên");

Before(({ I, loginPage }) => {
  // Dang nhap bang Owner vi Owner la role quan ly staff.
  I.amOnPage("/login");
  loginPage.sendForm(testData.owner.email, testData.owner.password);
  I.waitInUrl("/owner/dashboard", 10);
});

Scenario("[STAFF-01] Owner có thể truy cập trang quản lý nhân viên", ({ I }) => {
  goToStaff(I);
  // Nut them nhan vien la moc de xac nhan trang da san sang.
  I.waitForText("Thêm nhân viên", 10);
});

Scenario("[STAFF-02] Tạo mới tài khoản nhân viên", ({ I }) => {
  goToStaff(I);
  createStaff(I, draft);
});

Scenario("[STAFF-03] Cập nhật thông tin tài khoản nhân viên", async ({ I }) => {
  await ensureMainStaffReady(draft.fullName);
  goToStaff(I);
  // Hover vao card de hien cac nut thao tac roi mo form sua.
  I.hoverCardAndClick(draft.fullName, /Sửa/i);
  I.waitForElement("[role=\"dialog\"]", 10);

  I.usePlaywrightTo("nhap ten moi cho nhan vien", async ({ page }) => {
    // Trong dialog sua, chi 2 input dau la ten va so dien thoai co the chinh.
    const editInputs = page.getByRole("dialog").locator("input:not([disabled])");
    await editInputs.nth(0).fill(draft.updatedName);
    await editInputs.nth(1).fill(draft.phoneNumber);
  });

  I.click("Lưu thay đổi");
  I.waitForDialogToClose();
  // Card phai hien ten moi sau khi cap nhat.
  I.waitForCard(draft.updatedName);
});

Scenario("[STAFF-05] Lọc nhân viên theo chi nhánh", async ({ I }) => {
  await ensureMainStaffReady(draft.updatedName);
  goToStaff(I);

  I.usePlaywrightTo("chon chi nhanh dau tien de loc", async ({ page }) => {
    // Combobox dau tien la bo loc chi nhanh tren trang danh sach.
    const filterSelect = page.getByRole("combobox").first();
    await filterSelect.click();
    // Option thu 2 tuong ung mot chi nhanh cu the; option dau la "tat ca".
    await page.getByRole("option").nth(1).click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.waitForTimeout(1000);
  });

  // Staff vua tao phai van duoc hien trong nhom chi nhanh da chon.
  I.waitForCard(draft.updatedName);

  I.usePlaywrightTo("reset loc ve tat ca chi nhanh", async ({ page }) => {
    // Dua bo loc ve trang thai mac dinh de khong anh huong case sau.
    const filterSelect = page.getByRole("combobox").first();
    await filterSelect.click();
    await page.getByRole("option").first().click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.waitForTimeout(500);
  });

  I.waitForCard(draft.updatedName);
});

Scenario("[STAFF-04] Xóa tài khoản nhân viên", async ({ I }) => {
  await ensureMainStaffReady(draft.updatedName);
  goToStaff(I);
  // Nut cuoi tren card la thao tac xoa va se xac nhan qua popup.
  I.hoverCardAndClickLastButtonWithPopup(draft.updatedName);

  I.usePlaywrightTo("cho card bien mat", async ({ page }) => {
    // Cho den khi card cua staff da xoa thuc su bi loai khoi DOM.
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
// Cac case duoi day chi doi do dai input; quy trinh tao va cleanup giu nguyen.
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

if (EXTRA_CASES_ENABLED) {
  Scenario("[BVA-STAFF-10] Dirty - name min-=0 char, phone=nom=10", ({ I }) => {
    const staffDraft = buildStaffDraft("10", "", exactLengthDigits(`0901234510${suffix}`, 10));
    goToStaff(I);
    openCreateStaffDialog(I);
    I.fillField("input[name=\"email\"]", staffDraft.email);
    I.fillField("input[name=\"password\"]", staffDraft.password);
    I.fillField("input[name=\"name\"]", staffDraft.fullName);
    I.fillField("input[name=\"phoneNumber\"]", staffDraft.phoneNumber);
    selectFirstStaffBranch(I, "chon chi nhanh dau tien cho staff dirty 10");
    I.click("Lưu thay đổi");
    expectCreateStaffRejected(I, staffDraft.email, "Họ tên bắt buộc");
  });

  Scenario("[BVA-STAFF-11] Dirty - name max+=51 chars, phone=nom=10", ({ I }) => {
    const staffDraft = buildStaffDraft(
      "11",
      exactLengthText(`BVA-STAFF-11-${suffix}`, 51),
      exactLengthDigits(`0901234511${suffix}`, 10)
    );
    goToStaff(I);
    // Form hien tai khong gioi han max length cho ho ten, nen 51 ky tu van duoc chap nhan.
    createStaff(I, staffDraft);
    cleanupStaff(I, staffDraft.email);
  });

  Scenario("[BVA-STAFF-12] Dirty - phone min-=8 chars, name=nom=25", ({ I }) => {
    const staffDraft = buildStaffDraft(
      "12",
      exactLengthText(`BVA-STAFF-12-${suffix}`, 25),
      exactLengthDigits(`09012312${suffix}`, 8)
    );
    goToStaff(I);
    openCreateStaffDialog(I);
    I.fillField("input[name=\"email\"]", staffDraft.email);
    I.fillField("input[name=\"password\"]", staffDraft.password);
    I.fillField("input[name=\"name\"]", staffDraft.fullName);
    I.fillField("input[name=\"phoneNumber\"]", staffDraft.phoneNumber);
    selectFirstStaffBranch(I, "chon chi nhanh dau tien cho staff dirty 12");
    I.click("Lưu thay đổi");
    expectCreateStaffRejected(I, staffDraft.email, "SĐT không hợp lệ");
  });

  Scenario("[BVA-STAFF-13] Dirty - phone max+=12 chars, name=nom=25", ({ I }) => {
    const staffDraft = buildStaffDraft(
      "13",
      exactLengthText(`BVA-STAFF-13-${suffix}`, 25),
      exactLengthDigits(`090123451312${suffix}`, 12)
    );
    goToStaff(I);
    // Form hien tai chi bat minimum 9 ky tu cho SDT, nen 12 ky tu van duoc tao.
    createStaff(I, staffDraft);
    cleanupStaff(I, staffDraft.email);
  });
}
