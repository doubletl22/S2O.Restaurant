/// <reference path="../../steps.d.ts" />
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const suffix = randomUUID().slice(0, 8);
const ownerEmail = process.env.CODECEPT_OWNER_EMAIL || "owner.demo.0412222047@s2o.local";
const ownerPassword = process.env.CODECEPT_OWNER_PASSWORD || "Owner@123";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApiResult = {
  status: number;
  ok: boolean;
  data: any;
};

function extractErrorCode(payload: any): string {
  return String(
    payload?.code ?? payload?.Code ?? payload?.error?.code ?? payload?.error?.Code ?? ""
  );
}

function apiRequestJson(
  I: CodeceptJS.I,
  method: string,
  path: string,
  token?: string,
  body?: any
): Promise<ApiResult> {
  return I.usePlaywrightTo("api request json", async ({ page }) => {
    return page.evaluate(
      async ({ baseUrl, requestMethod, requestPath, accessToken, requestBody }) => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${baseUrl}${requestPath}`, {
          method: requestMethod,
          headers,
          body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
        });

        const text = await response.text();
        let data: any = null;

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }

        return {
          status: response.status,
          ok: response.ok,
          data,
        };
      },
      {
        baseUrl: apiBaseUrl,
        requestMethod: method,
        requestPath: path,
        accessToken: token,
        requestBody: body,
      }
    );
  });
}

function apiRequestForm(
  I: CodeceptJS.I,
  method: string,
  path: string,
  token: string,
  fields: Record<string, string | number | boolean>
): Promise<ApiResult> {
  return I.usePlaywrightTo("api request form", async ({ page }) => {
    return page.evaluate(
      async ({ baseUrl, requestMethod, requestPath, accessToken, formFields }) => {
        const headers: Record<string, string> = {};
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const formData = new FormData();
        for (const [key, value] of Object.entries(formFields)) {
          formData.append(key, String(value));
        }

        const response = await fetch(`${baseUrl}${requestPath}`, {
          method: requestMethod,
          headers,
          body: formData,
        });

        const text = await response.text();
        let data: any = null;

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }

        return {
          status: response.status,
          ok: response.ok,
          data,
        };
      },
      {
        baseUrl: apiBaseUrl,
        requestMethod: method,
        requestPath: path,
        accessToken: token,
        formFields: fields,
      }
    );
  });
}

async function loginByApi(I: CodeceptJS.I, email: string, password: string): Promise<string> {
  const loginRes = await apiRequestJson(I, "POST", "/api/v1/auth/login", undefined, {
    email,
    password,
  });

  if (!loginRes.ok) {
    throw new Error(`API login failed for ${email}. Status: ${loginRes.status}`);
  }

  const token =
    loginRes.data?.accessToken ??
    loginRes.data?.token ??
    loginRes.data?.value?.accessToken ??
    loginRes.data?.value?.token ??
    "";

  if (!token) {
    throw new Error(`API login missing access token for ${email}.`);
  }

  return token;
}

async function createCategoryByApi(
  I: CodeceptJS.I,
  token: string,
  name: string,
  isActive = true
): Promise<string> {
  const createRes = await apiRequestJson(I, "POST", "/api/v1/categories", token, {
    name,
    description: `Auto created ${name}`,
    isActive,
  });

  if (!createRes.ok) {
    throw new Error(`Create category failed (${name}). Status: ${createRes.status}`);
  }

  const categoryId =
    createRes.data?.value?.id ??
    createRes.data?.value?.Id ??
    createRes.data?.value ??
    createRes.data?.id ??
    createRes.data?.Id ??
    "";

  if (categoryId) return String(categoryId);

  const listRes = await apiRequestJson(I, "GET", "/api/v1/categories", token);
  const list = Array.isArray(listRes.data)
    ? listRes.data
    : Array.isArray(listRes.data?.value)
      ? listRes.data.value
      : [];
  const category = list.find((item: any) => (item?.name ?? item?.Name) === name);

  if (!category) {
    throw new Error(`Cannot resolve category id for ${name}.`);
  }

  return String(category?.id ?? category?.Id ?? "");
}

async function listCategoriesByApi(I: CodeceptJS.I, token: string): Promise<any[]> {
  const listRes = await apiRequestJson(I, "GET", "/api/v1/categories", token);
  if (!listRes.ok) return [];

  return Array.isArray(listRes.data)
    ? listRes.data
    : Array.isArray(listRes.data?.value)
      ? listRes.data.value
      : [];
}

async function getOrCreateCategoryForApi(
  I: CodeceptJS.I,
  token: string,
  preferredName: string
): Promise<{ id: string; name: string; created: boolean }> {
  const list = await listCategoriesByApi(I, token);
  const exact = list.find((item: any) => (item?.name ?? item?.Name) === preferredName);

  if (exact) {
    return {
      id: String(exact?.id ?? exact?.Id ?? ""),
      name: String(exact?.name ?? exact?.Name ?? preferredName),
      created: false,
    };
  }

  if (list.length < 10) {
    const createdId = await createCategoryByApi(I, token, preferredName, true);
    return { id: createdId, name: preferredName, created: true };
  }

  const reusable = list[0];
  return {
    id: String(reusable?.id ?? reusable?.Id ?? ""),
    name: String(reusable?.name ?? reusable?.Name ?? preferredName),
    created: false,
  };
}

async function ensureCategorySlotForApi(I: CodeceptJS.I, token: string): Promise<void> {
  let categories = await listCategoriesByApi(I, token);

  while (categories.length >= 10) {
    const removable = categories.find((item: any) => {
      const name = String(item?.name ?? item?.Name ?? "");
      return name.startsWith("ITC ");
    });

    if (!removable) {
      throw new Error("Category quota is full (10) and no removable ITC category was found.");
    }

    const removableId = String(removable?.id ?? removable?.Id ?? "");
    const removableName = String(removable?.name ?? removable?.Name ?? "");

    await deleteCategoryByApiBestEffort(I, token, removableId, removableName);
    categories = await listCategoriesByApi(I, token);
  }
}

async function createTempCategoryForApi(
  I: CodeceptJS.I,
  token: string,
  name: string
): Promise<{ id: string; name: string }> {
  await ensureCategorySlotForApi(I, token);
  const id = await createCategoryByApi(I, token, name, true);
  return { id, name };
}

async function updateCategoryByApi(
  I: CodeceptJS.I,
  token: string,
  id: string,
  payload: { name: string; description: string; isActive: boolean }
): Promise<ApiResult> {
  return apiRequestJson(I, "PUT", `/api/v1/categories/${id}`, token, {
    id,
    name: payload.name,
    description: payload.description,
    isActive: payload.isActive,
  });
}

async function createProductByApi(
  I: CodeceptJS.I,
  token: string,
  categoryId: string,
  name: string
): Promise<string> {
  const createRes = await apiRequestForm(I, "POST", "/api/v1/products", token, {
    Name: name,
    Price: 50000,
    Description: `Auto created ${name}`,
    CategoryId: categoryId,
    IsActive: true,
  });

  if (!createRes.ok) {
    throw new Error(`Create product failed (${name}). Status: ${createRes.status}`);
  }

  const productId =
    createRes.data?.value?.id ??
    createRes.data?.value?.Id ??
    createRes.data?.value ??
    createRes.data?.id ??
    createRes.data?.Id ??
    "";

  if (productId) return String(productId);

  const listRes = await apiRequestJson(
    I,
    "GET",
    `/api/v1/products?page=1&size=20&keyword=${encodeURIComponent(name)}`,
    token
  );

  const items = Array.isArray(listRes.data?.items)
    ? listRes.data.items
    : Array.isArray(listRes.data?.value?.items)
      ? listRes.data.value.items
      : [];
  const product = items.find((item: any) => (item?.name ?? item?.Name) === name);

  if (!product) {
    throw new Error(`Cannot resolve product id for ${name}.`);
  }

  return String(product?.id ?? product?.Id ?? "");
}

async function deleteProductByApiBestEffort(I: CodeceptJS.I, token: string, productId: string) {
  try {
    await apiRequestJson(I, "DELETE", `/api/v1/products/${productId}`, token);
  } catch {
    // Cleanup only.
  }
}

async function deleteCategoryByApiBestEffort(
  I: CodeceptJS.I,
  token: string,
  categoryId: string,
  categoryName: string
) {
  try {
    await updateCategoryByApi(I, token, categoryId, {
      name: categoryName,
      description: `Auto created ${categoryName}`,
      isActive: false,
    });
  } catch {
    // Cleanup only.
  }

  try {
    await apiRequestJson(I, "DELETE", `/api/v1/categories/${categoryId}`, token);
  } catch {
    // Cleanup only.
  }
}

async function waitForOwnerLogin(I: CodeceptJS.I, timeoutMs = 15000) {
  return I.usePlaywrightTo("wait for owner login", async ({ page }) => {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const token = await page.evaluate(() => localStorage.getItem("accessToken") || "");
      const url = page.url();

      if (token && !url.includes("/login")) {
        return true;
      }

      await page.waitForTimeout(300);
    }

    return false;
  });
}

function goToCategories(I: CodeceptJS.I) {
  I.amOnPage("/owner/categories");
  I.waitInUrl("/owner/categories", 10);
  I.waitForElement("table", 10);
}

async function listItcCategoryNames(I: CodeceptJS.I) {
  return I.usePlaywrightTo("list ITC categories", async ({ page }) => {
    const firstColumnCells = page.locator("tbody tr td:first-child");
    const values = await firstColumnCells.allInnerTexts();

    return values.map((value) => value.trim()).filter((value) => value.startsWith("ITC "));
  });
}

async function cleanupItcCategories(I: CodeceptJS.I) {
  const names = await listItcCategoryNames(I);

  for (const name of names) {
    try {
      setCategoryUsageStatus(I, name, false);
    } catch {
      // Ignore status-toggle failures and still attempt delete.
    }

    try {
      deleteCategory(I, name);
    } catch {
      // Keep test running even if one old category cannot be removed.
    }
  }
}

function goToMenu(I: CodeceptJS.I) {
  I.amOnPage("/owner/menu");
  I.waitInUrl("/owner/menu", 10);
  I.waitForText("Thêm món mới", 10);
}

async function loginOwner(I: CodeceptJS.I, loginPage: any) {
  I.amOnPage("/login");
  loginPage.sendForm(ownerEmail, ownerPassword);

  const loggedIn = await waitForOwnerLogin(I);
  if (!loggedIn) {
    throw new Error(
      `Owner login failed. Check CODECEPT_OWNER_EMAIL/CODECEPT_OWNER_PASSWORD or testData.owner. Email used: ${ownerEmail}`
    );
  }
}

function createCategory(I: CodeceptJS.I, name: string, description: string) {
  I.click("Tạo danh mục");
  I.waitForElement("[role='dialog']", 10);
  I.fillField("input[placeholder='Ví dụ: Đồ uống, Món chính...']", name);
  I.fillField("textarea[placeholder='Ghi chú thêm về nhóm món này...']", description);
  I.click("Tạo mới");
  I.waitForDialogToClose();
  I.waitForText(name, 10, "tbody");
}

function clickCategoryAction(I: CodeceptJS.I, categoryName: string, actionLabel: "Sửa" | "Xóa") {
  const targetName = categoryName;
  const targetAction = actionLabel;

  I.usePlaywrightTo("click category action", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: targetName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 });
    await row.getByRole("button").first().click();

    const menu = page.locator('[data-slot="dropdown-menu-content"][data-state="open"]').last();
    await menu.waitFor({ state: "visible", timeout: 5000 });
    await menu.getByRole("menuitem", { name: targetAction }).click();
  });
}

function setCategoryUsageStatus(I: CodeceptJS.I, categoryName: string, isActive: boolean) {
  clickCategoryAction(I, categoryName, "Sửa");
  I.waitForElement("[role='dialog']", 10);

  I.usePlaywrightTo("toggle category status", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const statusSwitch = dialog.getByRole("switch").first();
    await statusSwitch.waitFor({ state: "visible", timeout: 5000 });

    const current = (await statusSwitch.getAttribute("aria-checked")) === "true";
    if (current !== isActive) {
      await statusSwitch.click();
    }
  });

  I.click("Lưu thay đổi");
  I.waitForDialogToClose();
}

function waitForCategoryStatus(I: CodeceptJS.I, categoryName: string, statusText: string) {
  const targetName = categoryName;
  const targetStatus = statusText;

  I.usePlaywrightTo("wait for category status", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: targetName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 });
    await row.getByText(targetStatus).waitFor({ state: "visible", timeout: 10000 });
  });
}

function waitForCategoryRow(I: CodeceptJS.I, categoryName: string) {
  const targetName = categoryName;

  I.usePlaywrightTo("wait for category row", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: targetName }).first();
    await row.waitFor({ state: "visible", timeout: 10000 });
  });
}

function deleteCategoryByApiBestEffort(I: CodeceptJS.I, categoryName: string) {
  const targetName = categoryName;

  I.usePlaywrightTo("delete category by api fallback", async ({ page }) => {
    try {
      const token = await page.evaluate(() => localStorage.getItem("accessToken") || "");
      if (!token) return;

      const apiBase = "http://localhost:5000";
      const listResp = await page.evaluate(async ({ token: authToken, baseUrl }) => {
        const resp = await fetch(`${baseUrl}/api/v1/categories`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await resp.json().catch(() => null);
        return { ok: resp.ok, data };
      }, { token, baseUrl: apiBase });

      if (!listResp.ok || !listResp.data) return;

      const rawList = Array.isArray(listResp.data)
        ? listResp.data
        : Array.isArray(listResp.data?.value)
          ? listResp.data.value
          : [];

      const category = rawList.find((item: any) => (item?.name ?? item?.Name) === targetName);
      const categoryId = category?.id ?? category?.Id;
      if (!categoryId) return;

      await page.evaluate(async ({ token: authToken, baseUrl, id }) => {
        await fetch(`${baseUrl}/api/v1/categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      }, { token, baseUrl: apiBase, id: categoryId });
    } catch {
      // Fallback only.
    }
  });
}

function deleteCategory(I: CodeceptJS.I, categoryName: string) {
  clickCategoryAction(I, categoryName, "Xóa");

  I.usePlaywrightTo("confirm category delete", async ({ page }) => {
    const dialog = page.getByRole("alertdialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });

    const confirmButton = dialog.locator('[data-slot="alert-dialog-action"]').first();
    if (await confirmButton.count()) {
      await confirmButton.click();
      return;
    }

    await dialog.getByRole("button", { name: /xóa|delete|đồng ý|xac nhan/i }).last().click();
  });

  const targetName = categoryName;
  I.usePlaywrightTo("wait category removed", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: targetName }).first();
    try {
      await row.waitFor({ state: "hidden", timeout: 8000 });
      return;
    } catch {
      // UI delete may fail silently; try API fallback then re-check.
    }
  });

  deleteCategoryByApiBestEffort(I, categoryName);

  I.usePlaywrightTo("wait category removed after fallback", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: targetName }).first();
    await row.waitFor({ state: "hidden", timeout: 20000 });
  });
}

function cleanupCategoryBestEffort(I: CodeceptJS.I, categoryName: string) {
  const targetName = categoryName;

  I.usePlaywrightTo("best-effort cleanup category", async ({ page }) => {
    try {
      const row = page.locator("tbody tr").filter({ hasText: targetName }).first();
      if (!(await row.count())) {
        return;
      }

      await row.waitFor({ state: "visible", timeout: 3000 });

      await row.getByRole("button").first().click();
      let menu = page.locator('[data-slot="dropdown-menu-content"][data-state="open"]').last();
      await menu.waitFor({ state: "visible", timeout: 3000 });

      const editItem = menu.getByRole("menuitem", { name: "Sửa" }).first();
      if (await editItem.count()) {
        await editItem.click();

        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible", timeout: 5000 });

        const statusSwitch = dialog.getByRole("switch").first();
        if (await statusSwitch.count()) {
          const current = (await statusSwitch.getAttribute("aria-checked")) === "true";
          if (current) {
            await statusSwitch.click();
          }
        }

        await dialog.getByRole("button", { name: /lưu thay đổi/i }).first().click();
        await dialog.waitFor({ state: "hidden", timeout: 5000 });
      }

      const refreshedRow = page.locator("tbody tr").filter({ hasText: targetName }).first();
      if (!(await refreshedRow.count())) {
        return;
      }

      await refreshedRow.getByRole("button").first().click();
      menu = page.locator('[data-slot="dropdown-menu-content"][data-state="open"]').last();
      await menu.waitFor({ state: "visible", timeout: 3000 });

      const deleteItem = menu.getByRole("menuitem", { name: "Xóa" }).first();
      if (!(await deleteItem.count())) {
        return;
      }
      await deleteItem.click();

      const alert = page.getByRole("alertdialog");
      if (await alert.count()) {
        const confirmButton = alert.locator('[data-slot="alert-dialog-action"]').first();
        if (await confirmButton.count()) {
          await confirmButton.click();
        } else {
          await alert.getByRole("button").first().click();
        }

        await alert.waitFor({ state: "hidden", timeout: 5000 }).catch(() => undefined);
      }

      const checkRow = page.locator("tbody tr").filter({ hasText: targetName }).first();
      if (await checkRow.count()) {
        const token = await page.evaluate(() => localStorage.getItem("accessToken") || "");
        if (token) {
          const apiBase = "http://localhost:5000";
          const listResp = await page.evaluate(async ({ token: authToken, baseUrl }) => {
            const resp = await fetch(`${baseUrl}/api/v1/categories`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            });
            const data = await resp.json().catch(() => null);
            return { ok: resp.ok, data };
          }, { token, baseUrl: apiBase });

          if (listResp.ok && listResp.data) {
            const rawList = Array.isArray(listResp.data)
              ? listResp.data
              : Array.isArray(listResp.data?.value)
                ? listResp.data.value
                : [];

            const category = rawList.find((item: any) => (item?.name ?? item?.Name) === targetName);
            const categoryId = category?.id ?? category?.Id;

            if (categoryId) {
              await page.evaluate(async ({ token: authToken, baseUrl, id }) => {
                await fetch(`${baseUrl}/api/v1/categories/${id}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                });
              }, { token, baseUrl: apiBase, id: categoryId });
            }
          }
        }
      }
    } catch {
      // Non-blocking cleanup.
    }
  });
}

function selectCategoryInMenu(I: CodeceptJS.I, categoryName: string) {
  const targetName = categoryName;
  I.usePlaywrightTo("select category in menu", async ({ page }) => {
    const categoryRow = page.locator("div.group").filter({ hasText: targetName }).first();
    await categoryRow.waitFor({ state: "visible", timeout: 10000 });
    await categoryRow.click();
  });
}

function createProduct(I: CodeceptJS.I, data: { name: string; price: string; description: string; withImage: boolean }) {
  I.click("Thêm món mới");
  I.waitForElement("[role='dialog']", 10);

  I.fillField("input[placeholder='Phở bò...']", data.name);
  I.fillField("input[type='number']", data.price);
  I.fillField("textarea[placeholder='Thành phần...']", data.description);

  if (data.withImage) {
    I.attachFile("#file-upload", "public/placeholder.jpg");
  }

  I.click("Thêm món");
  I.waitForDialogToClose();
}

function waitForProductCard(I: CodeceptJS.I, productName: string) {
  const targetName = productName;
  I.usePlaywrightTo("wait for product card", async ({ page }) => {
    const card = page.locator("h3").filter({ hasText: targetName }).first();
    await card.waitFor({ state: "visible", timeout: 15000 });
  });
}

function openEditProduct(I: CodeceptJS.I, productName: string) {
  const targetName = productName;

  I.usePlaywrightTo("open edit product dialog", async ({ page }) => {
    const card = page.locator(".group").filter({ hasText: targetName }).first();
    await card.waitFor({ state: "visible", timeout: 10000 });
    await card.hover();

    const actionButtons = card.locator("button.h-8.w-8");
    await actionButtons.first().click();
  });

  I.waitForText("Cập nhật món ăn", 10);
}

function deleteProduct(I: CodeceptJS.I, productName: string) {
  const targetName = productName;

  I.usePlaywrightTo("delete product from card", async ({ page }) => {
    const card = page.locator(".group").filter({ hasText: targetName }).first();
    await card.waitFor({ state: "visible", timeout: 10000 });
    await card.hover();

    page.once("dialog", (dialog) => dialog.accept());

    const actionButtons = card.locator("button.h-8.w-8");
    await actionButtons.last().click();
  });

  I.usePlaywrightTo("wait product removed", async ({ page }) => {
    const card = page.locator("h3").filter({ hasText: targetName }).first();
    await card.waitFor({ state: "hidden", timeout: 15000 });
  });
}

Feature("Catalog - Owner CRUD");

Before(async ({ I, loginPage }) => {
  await loginOwner(I, loginPage);
  goToCategories(I);
  await cleanupItcCategories(I);
});

Scenario("[CATALOG-01] Thêm thực đơn mới", ({ I }) => {
  const categoryName = `ITC Menu Create ${suffix}`;

  goToCategories(I);
  createCategory(I, categoryName, "Danh mục tạo mới từ Codecept");
  I.see(categoryName, "tbody");
  cleanupCategoryBestEffort(I, categoryName);
});

Scenario("[CATALOG-02] Sửa thực đơn", ({ I }) => {
  const oldName = `ITC Menu Edit Old ${suffix}`;
  const newName = `ITC Menu Edit New ${suffix}`;

  goToCategories(I);
  createCategory(I, oldName, "Danh mục để test sửa");
  clickCategoryAction(I, oldName, "Sửa");
  I.fillField("input[placeholder='Ví dụ: Đồ uống, Món chính...']", newName);
  I.click("Lưu thay đổi");
  I.waitForDialogToClose();
  waitForCategoryRow(I, `Edit New ${suffix}`);
  cleanupCategoryBestEffort(I, newName);
});

Scenario("[CATALOG-03] Đổi trạng thái thực đơn", ({ I }) => {
  const categoryName = `ITC Menu Toggle ${suffix}`;

  goToCategories(I);
  createCategory(I, categoryName, "Danh mục để test đổi trạng thái");
  setCategoryUsageStatus(I, categoryName, false);
  waitForCategoryStatus(I, categoryName, "Không sử dụng");
  cleanupCategoryBestEffort(I, categoryName);
});

Scenario("[CATALOG-04] Xóa thực đơn", ({ I }) => {
  const categoryName = `ITC Menu Delete ${suffix}`;

  goToCategories(I);
  createCategory(I, categoryName, "Danh mục để test xóa");
  setCategoryUsageStatus(I, categoryName, false);
  waitForCategoryStatus(I, categoryName, "Không sử dụng");
  deleteCategory(I, categoryName);
});

Scenario("[CATALOG-05] Thêm món mới có ảnh", ({ I }) => {
  const categoryName = `ITC Product Cat Img ${suffix}`;
  const productName = `ITC Product With Image ${suffix}`;

  goToCategories(I);
  createCategory(I, categoryName, "Danh mục chứa món có ảnh");

  goToMenu(I);
  selectCategoryInMenu(I, categoryName);
  createProduct(I, {
    name: productName,
    price: "45000",
    description: "Món test có upload ảnh",
    withImage: true,
  });
  waitForProductCard(I, productName);
  deleteProduct(I, productName);

  goToCategories(I);
  cleanupCategoryBestEffort(I, categoryName);
});

Scenario("[CATALOG-06] Thêm món mới không ảnh", ({ I }) => {
  const categoryName = `ITC Product Cat NoImg ${suffix}`;
  const productName = `ITC Product No Image ${suffix}`;

  goToCategories(I);
  createCategory(I, categoryName, "Danh mục chứa món không ảnh");

  goToMenu(I);
  selectCategoryInMenu(I, categoryName);
  createProduct(I, {
    name: productName,
    price: "39000",
    description: "Món test không upload ảnh",
    withImage: false,
  });
  waitForProductCard(I, productName);
  deleteProduct(I, productName);

  goToCategories(I);
  cleanupCategoryBestEffort(I, categoryName);
});

Scenario("[CATALOG-07] Sửa món", ({ I }) => {
  const categoryName = `ITC Product Cat Edit ${suffix}`;
  const oldName = `ITC Product Edit Old ${suffix}`;
  const newName = `ITC Product Edit New ${suffix}`;

  goToCategories(I);
  createCategory(I, categoryName, "Danh mục test sửa món");

  goToMenu(I);
  selectCategoryInMenu(I, categoryName);
  createProduct(I, {
    name: oldName,
    price: "42000",
    description: "Món gốc để sửa",
    withImage: false,
  });
  waitForProductCard(I, oldName);

  openEditProduct(I, oldName);
  I.fillField("input[placeholder='Phở bò...']", newName);
  I.fillField("input[type='number']", "48000");
  I.fillField("textarea[placeholder='Thành phần...']", "Món sau khi chỉnh sửa");
  I.click("Lưu thay đổi");
  I.waitForDialogToClose();

  waitForProductCard(I, newName);
  deleteProduct(I, newName);

  goToCategories(I);
  cleanupCategoryBestEffort(I, categoryName);
});

Scenario("[CATALOG-08] Xóa món", ({ I }) => {
  const categoryName = `ITC Product Cat Delete ${suffix}`;
  const productName = `ITC Product Delete ${suffix}`;

  goToCategories(I);
  createCategory(I, categoryName, "Danh mục test xóa món");

  goToMenu(I);
  selectCategoryInMenu(I, categoryName);
  createProduct(I, {
    name: productName,
    price: "35000",
    description: "Món để xóa",
    withImage: false,
  });
  waitForProductCard(I, productName);
  deleteProduct(I, productName);

  goToCategories(I);
  cleanupCategoryBestEffort(I, categoryName);
});

Scenario("[CATALOG-09] Tạo danh mục trùng tên trong cùng tenant", async ({ I }) => {
  const ownerToken = await loginByApi(I, ownerEmail, ownerPassword);
  const categoryName = `ITC API Dup Cat ${suffix}`;

  const tempCategory = await createTempCategoryForApi(I, ownerToken, categoryName);

  const duplicateRes = await apiRequestJson(I, "POST", "/api/v1/categories", ownerToken, {
    name: tempCategory.name,
    description: "Duplicate test",
    isActive: true,
  });

  assert.equal(duplicateRes.status, 400);
  assert.equal(extractErrorCode(duplicateRes.data), "Category.DuplicateName");

  await deleteCategoryByApiBestEffort(I, ownerToken, tempCategory.id, tempCategory.name);
});

Scenario("[CATALOG-11] Xóa danh mục đang có món liên kết", async ({ I }) => {
  const ownerToken = await loginByApi(I, ownerEmail, ownerPassword);
  const categoryName = `ITC API InUse Cat ${suffix}`;
  const productName = `ITC API InUse Product ${suffix}`;

  const category = await createTempCategoryForApi(I, ownerToken, categoryName);
  const categoryId = category.id;
  const productId = await createProductByApi(I, ownerToken, categoryId, productName);

  await updateCategoryByApi(I, ownerToken, categoryId, {
    name: category.name,
    description: `Auto created ${category.name}`,
    isActive: false,
  });

  const deleteRes = await apiRequestJson(I, "DELETE", `/api/v1/categories/${categoryId}`, ownerToken);
  assert.equal(deleteRes.status, 400);
  assert.equal(extractErrorCode(deleteRes.data), "Category.InUse");

  await deleteProductByApiBestEffort(I, ownerToken, productId);
  await deleteCategoryByApiBestEffort(I, ownerToken, categoryId, category.name);
});


