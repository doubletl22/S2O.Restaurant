/// <reference types="codeceptjs" />

type TenantDraft = {
  restaurantName: string;
  address: string;
  phoneNumber: string;
  ownerName: string;
  email: string;
  password: string;
};

type AdminDraft = {
  email: string;
  fullName: string;
  password: string;
};

type StaffDraft = {
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
  updatedName: string;
};

const NEXT_PAGE_LABEL = "Sau";
const PREVIOUS_PAGE_LABEL = "Tr\u01b0\u1edbc";
const TABLE_SETTLE_DELAY_MS = 450;

async function findTableRowAcrossPages(page: any, rowText: string) {
  const nextButton = page.getByRole("button", { name: NEXT_PAGE_LABEL });

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const row = page.locator("tbody tr").filter({ hasText: rowText }).first();

    if (await row.count()) {
      return row;
    }

    if (!(await nextButton.count())) {
      break;
    }

    if (await nextButton.isDisabled()) {
      break;
    }

    await nextButton.click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.waitForTimeout(400);
  }

  return null;
}

async function resetTablePagination(page: any) {
  const previousButton = page.getByRole("button", { name: PREVIOUS_PAGE_LABEL });

  while ((await previousButton.count()) && !(await previousButton.isDisabled())) {
    await previousButton.click();
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.waitForTimeout(300);
  }
}

async function waitForTableToSettle(page: any) {
  await page.waitForTimeout(TABLE_SETTLE_DELAY_MS);
  await page.waitForLoadState("networkidle").catch(() => undefined);
}

async function clickTableMenuItem(page: any, rowText: string, menuIndex: number, acceptPopup = false) {
  await waitForTableToSettle(page);

  const row = await findTableRowAcrossPages(page, rowText);

  if (!row) {
    throw new Error(`Unable to find table row for "${rowText}"`);
  }

  if (acceptPopup) {
    page.once("dialog", (dialog: any) => dialog.accept());
  }

  await row.getByRole("button").first().click();

  const openMenu = page.locator('[data-slot="dropdown-menu-content"][data-state="open"]').last();

  await openMenu.waitFor({ state: "visible", timeout: 5000 });

  const menuItem = openMenu.getByRole("menuitem").nth(menuIndex);

  await menuItem.waitFor({ state: "visible", timeout: 5000 });
  await menuItem.click();
}

// @ts-ignore — export = required by CodeceptJS (CommonJS), VS Code uses tsconfig.json (esnext)
export = function () {
  return actor({
    fillVisibleDialogInputs(values: string[]) {
      const inputValues = [...values];

      return this.usePlaywrightTo("fill visible dialog inputs", async ({ page }) => {
        const inputs = page.getByRole("dialog").locator("input:not([disabled])");

        for (let index = 0; index < inputValues.length; index += 1) {
          await inputs.nth(index).fill(inputValues[index]);
        }
      });
    },

    fillTenantRegistrationDialog(draft: TenantDraft) {
      const registrationDraft = { ...draft };

      return this.usePlaywrightTo("fill tenant registration dialog", async ({ page }) => {
        const dialog = page.getByRole("dialog");

        await dialog.locator('input[placeholder="Kichi Kichi..."]').fill(registrationDraft.restaurantName);
        await dialog.locator('input[placeholder="123 Đường ABC..."]').fill(registrationDraft.address);
        await dialog.locator('input[placeholder="0909..."]').fill(registrationDraft.phoneNumber);
        await dialog.locator('input[placeholder="Nguyễn Văn A"]').fill(registrationDraft.ownerName);
        await dialog.locator('input[placeholder="owner@gmail.com"]').fill(registrationDraft.email);
        await dialog.locator('input[type="password"]').fill(registrationDraft.password);
      });
    },

    clickTableRowAction(rowText: string, menuIndex: number) {
      const targetRowText = rowText;
      const targetMenuIndex = menuIndex;

      return this.usePlaywrightTo("click table row action", async ({ page }) => {
        await clickTableMenuItem(page, targetRowText, targetMenuIndex);
      });
    },

    clickTableRowActionAndAcceptPopup(rowText: string, menuIndex: number) {
      const targetRowText = rowText;
      const targetMenuIndex = menuIndex;

      return this.usePlaywrightTo("click table row action and accept popup", async ({ page }) => {
        await clickTableMenuItem(page, targetRowText, targetMenuIndex, true);
      });
    },

    waitForTableRow(rowText: string) {
      const targetRowText = rowText;

      return this.usePlaywrightTo("wait for table row", async ({ page }) => {
        const deadline = Date.now() + 10000;

        while (Date.now() < deadline) {
          await waitForTableToSettle(page);
          await resetTablePagination(page);

          const row = await findTableRowAcrossPages(page, targetRowText);

          if (row) {
            return;
          }

          await page.waitForTimeout(500);
        }

        throw new Error(`Unable to find table row for "${targetRowText}"`);
      });
    },

    waitForTableRowStatus(rowText: string, statusText: string) {
      const targetRowText = rowText;
      const targetStatusText = statusText;

      return this.usePlaywrightTo("wait for table row status", async ({ page }) => {
        const deadline = Date.now() + 10000;

        while (Date.now() < deadline) {
          await waitForTableToSettle(page);
          await resetTablePagination(page);

          const row = await findTableRowAcrossPages(page, targetRowText);

          if (row && (await row.getByText(targetStatusText).count())) {
            await row.getByText(targetStatusText).waitFor({ state: "visible", timeout: 1000 });
            return;
          }

          await page.waitForTimeout(500);
        }

        throw new Error(`Unable to find status "${targetStatusText}" for "${targetRowText}"`);
      });
    },

    assertNoTableRow(rowText: string) {
      const targetRowText = rowText;

      return this.usePlaywrightTo("assert table row is absent", async ({ page }) => {
        const deadline = Date.now() + 10000;

        while (Date.now() < deadline) {
          await waitForTableToSettle(page);
          await resetTablePagination(page);

          const row = await findTableRowAcrossPages(page, targetRowText);

          if (!row) {
            return;
          }

          await page.waitForTimeout(500);
        }

        throw new Error(`Expected "${targetRowText}" to be absent from the table`);
      });
    },

    hoverCardAndClick(cardText: string, buttonLabel: string | RegExp) {
      const targetCardText = cardText;
      const targetButtonLabel = buttonLabel;

      return this.usePlaywrightTo("hover card and click action", async ({ page }) => {
        const card = page.locator(".group").filter({ hasText: targetCardText }).first();

        await card.hover();
        await card.getByRole("button", { name: targetButtonLabel }).click();
      });
    },

    hoverCardAndClickLastButton(cardText: string) {
      const targetCardText = cardText;

      return this.usePlaywrightTo("hover card and click last button", async ({ page }) => {
        const card = page.locator(".group").filter({ hasText: targetCardText }).first();

        await card.hover();
        await card.locator("button").last().click();
      });
    },

    hoverCardAndClickLastButtonWithPopup(cardText: string) {
      const targetCardText = cardText;

      return this.usePlaywrightTo("hover card and click last button with popup", async ({ page }) => {
        const card = page.locator(".group").filter({ hasText: targetCardText }).first();

        page.once("dialog", (dialog: any) => dialog.accept());

        await card.hover();
        await card.locator("button").last().click();
      });
    },

    assertNoCard(cardText: string) {
      const targetCardText = cardText;

      return this.usePlaywrightTo("assert card is absent", async ({ page }) => {
        const deadline = Date.now() + 10000;

        while (Date.now() < deadline) {
          const cardCount = await page.locator(".group").filter({ hasText: targetCardText }).count();

          if (cardCount === 0) {
            return;
          }

          await page.waitForTimeout(300);
        }

        throw new Error(`Expected "${targetCardText}" card to be absent`);
      });
    },

    waitForCard(cardText: string) {
      const targetCardText = cardText;

      return this.usePlaywrightTo("wait for card", async ({ page }) => {
        const deadline = Date.now() + 15000;

        while (Date.now() < deadline) {
          const card = page.locator(".group").filter({ hasText: targetCardText }).first();

          if (await card.count()) {
            await card.waitFor({ state: "visible", timeout: 1000 });
            return;
          }

          await page.waitForTimeout(500);
        }

        throw new Error(`Unable to find card for "${targetCardText}"`);
      });
    },

    waitForDialogToClose() {
      return this.usePlaywrightTo("wait for dialog to close", async ({ page }) => {
        await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 10000 });
      });
    },

    closeDialog() {
      return this.usePlaywrightTo("close dialog", async ({ page }) => {
        const closeButton = page.getByRole("button", { name: "Close" });

        if (await closeButton.count()) {
          await closeButton.click();
          return;
        }

        await page.keyboard.press("Escape");
      });
    },

    confirmAlertDialog() {
      return this.usePlaywrightTo("confirm alert dialog", async ({ page }) => {
        const dialog = page.getByRole("alertdialog");

        await dialog.waitFor({ state: "visible", timeout: 10000 });
        await dialog.getByRole("button").last().click();
      });
    },

    completeSystemAdminLifecycle(draft: AdminDraft) {
      const adminDraft = { ...draft };

      return this.usePlaywrightTo("complete system admin lifecycle", async ({ page }) => {
        const searchInput = page.locator('input[placeholder="T\u00ecm user..."]');
        const row = () => page.locator("tbody tr").filter({ hasText: adminDraft.email }).first();

        await page.getByRole("button", { name: "Th\u00eam Admin" }).click();
        await page.getByRole("dialog").waitFor({ state: "visible", timeout: 10000 });

        const createInputs = page.getByRole("dialog").locator("input:not([disabled])");
        await createInputs.nth(0).fill(adminDraft.email);
        await createInputs.nth(1).fill(adminDraft.fullName);
        await createInputs.nth(2).fill(adminDraft.password);

        await page.getByRole("button", { name: "T\u1ea1o t\u00e0i kho\u1ea3n" }).click();
        await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 10000 });

        await searchInput.fill(adminDraft.email);
        await row().waitFor({ state: "visible", timeout: 10000 });

        await clickTableMenuItem(page, adminDraft.email, 0);
        await page.getByRole("dialog").waitFor({ state: "visible", timeout: 10000 });
        await page.getByRole("button", { name: "Close" }).click();
        await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 10000 });

        await clickTableMenuItem(page, adminDraft.email, 1, true);
        await row().getByText("Locked").waitFor({ state: "visible", timeout: 10000 });

        await clickTableMenuItem(page, adminDraft.email, 1, true);
        await row().getByText("Active").waitFor({ state: "visible", timeout: 10000 });

        await clickTableMenuItem(page, adminDraft.email, 2, true);
        await row().waitFor({ state: "hidden", timeout: 10000 });
      });
    },

    completeRestaurantLifecycle(draft: TenantDraft) {
      const tenantDraft = { ...draft };

      return this.usePlaywrightTo("complete restaurant lifecycle", async ({ page }) => {
        const searchInput = page.locator('input[placeholder="T\u00ecm ki\u1ebfm nh\u00e0 h\u00e0ng..."]');

        const findRestaurantRow = async () => {
          const deadline = Date.now() + 15000;

          while (Date.now() < deadline) {
            await searchInput.fill(tenantDraft.restaurantName);
            await page.waitForTimeout(1000);
            await resetTablePagination(page);

            const row = await findTableRowAcrossPages(page, tenantDraft.restaurantName);

            if (row) {
              return row;
            }

            await page.waitForTimeout(500);
          }

          throw new Error(`Unable to find table row for "${tenantDraft.restaurantName}"`);
        };

        await page.getByRole("button", { name: "\u0110\u0103ng k\u00fd m\u1edbi" }).click();
        await page.getByRole("dialog").waitFor({ state: "visible", timeout: 10000 });

        const createInputs = page.getByRole("dialog").locator("input:not([disabled])");
        await createInputs.nth(0).fill(tenantDraft.restaurantName);
        await createInputs.nth(1).fill(tenantDraft.address);
        await createInputs.nth(2).fill(tenantDraft.phoneNumber);
        await createInputs.nth(3).fill(tenantDraft.ownerName);
        await createInputs.nth(4).fill(tenantDraft.email);
        await createInputs.nth(5).fill(tenantDraft.password);

        await page.getByRole("button", { name: "Kh\u1edfi t\u1ea1o Nh\u00e0 h\u00e0ng" }).click();
        await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 10000 });

        await findRestaurantRow();
        await clickTableMenuItem(page, tenantDraft.restaurantName, 0, true);
        await (await findRestaurantRow()).getByText("Locked").waitFor({ state: "visible", timeout: 10000 });

        await clickTableMenuItem(page, tenantDraft.restaurantName, 0, true);
        await (await findRestaurantRow()).getByText("Active").waitFor({ state: "visible", timeout: 10000 });

        await clickTableMenuItem(page, tenantDraft.restaurantName, 1);
        await page.getByRole("alertdialog").waitFor({ state: "visible", timeout: 10000 });
        await page.getByRole("alertdialog").getByRole("button").last().click();

        const deleteDeadline = Date.now() + 10000;

        while (Date.now() < deleteDeadline) {
          await searchInput.fill(tenantDraft.restaurantName);
          await page.waitForTimeout(1000);
          await resetTablePagination(page);

          const deletedRow = await findTableRowAcrossPages(page, tenantDraft.restaurantName);

          if (!deletedRow) {
            return;
          }

          await page.waitForTimeout(500);
        }

        throw new Error(`Expected "${tenantDraft.restaurantName}" to be absent from the table`);
      });
    },

    completeStaffLifecycle(draft: StaffDraft) {
      const staffDraft = { ...draft };

      return this.usePlaywrightTo("complete staff lifecycle", async ({ page }) => {
        const createdCard = () => page.locator(".group").filter({ hasText: staffDraft.fullName }).first();
        const updatedCard = () => page.locator(".group").filter({ hasText: staffDraft.updatedName }).first();

        await page.getByRole("button", { name: "Th\u00eam nh\u00e2n vi\u00ean" }).click();
        await page.getByRole("dialog").waitFor({ state: "visible", timeout: 10000 });

        const createInputs = page.getByRole("dialog").locator("input:not([disabled])");
        await createInputs.nth(0).fill(staffDraft.email);
        await createInputs.nth(1).fill(staffDraft.password);
        await createInputs.nth(2).fill(staffDraft.fullName);
        await createInputs.nth(3).fill(staffDraft.phoneNumber);

        const branchSelect = page.getByRole("dialog").getByRole("combobox").nth(1);
        await branchSelect.click();
        await page.getByRole("option").first().click();

        await page.getByRole("button", { name: "L\u01b0u thay \u0111\u1ed5i" }).click();
        await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 10000 });
        await createdCard().waitFor({ state: "visible", timeout: 10000 });

        await createdCard().hover();
        await createdCard().getByRole("button", { name: /S\u1eeda/i }).click();
        await page.getByRole("dialog").waitFor({ state: "visible", timeout: 10000 });

        const editInputs = page.getByRole("dialog").locator("input:not([disabled])");
        await editInputs.nth(0).fill(staffDraft.updatedName);
        await editInputs.nth(1).fill(staffDraft.phoneNumber);

        await page.getByRole("button", { name: "L\u01b0u thay \u0111\u1ed5i" }).click();
        await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 10000 });
        await updatedCard().waitFor({ state: "visible", timeout: 10000 });

        page.once("dialog", (dialog: any) => dialog.accept());
        await updatedCard().hover();
        await updatedCard().locator("button").last().click();
        await updatedCard().waitFor({ state: "hidden", timeout: 10000 });
      });
    },
  });
};
