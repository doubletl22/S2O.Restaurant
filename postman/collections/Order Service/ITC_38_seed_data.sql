-- ITC_38 seed script
-- Chay tren PostgreSQL cho 2 DB: S2O_Tenant_Db va S2O_Order_Db
-- Truoc khi chay: thay cac placeholder bang gia tri that
--   :tenant_id, :branch_id, :target_table_id

-- =====================================================
-- A) CASE ITC_38.2: Tat ca ban trong
-- DB: S2O_Tenant_Db
-- =====================================================
UPDATE "Tables"
SET "IsActive" = TRUE,
    "IsOccupied" = FALSE,
    "UpdatedAtUtc" = NOW()
WHERE "TenantId" = ':tenant_id'::uuid
  AND "BranchId" = ':branch_id'::uuid;

-- =====================================================
-- B) CASE ITC_38.3: Tat ca ban co khach / yeu cau thanh toan
-- DB: S2O_Tenant_Db
-- =====================================================
UPDATE "Tables"
SET "IsActive" = TRUE,
    "IsOccupied" = TRUE,
    "UpdatedAtUtc" = NOW()
WHERE "TenantId" = ':tenant_id'::uuid
  AND "BranchId" = ':branch_id'::uuid;

-- =====================================================
-- C) CASE ITC_38.5: Dat 1 ban ve trang thai trong de test transition
-- DB: S2O_Tenant_Db
-- =====================================================
UPDATE "Tables"
SET "IsActive" = TRUE,
    "IsOccupied" = FALSE,
    "UpdatedAtUtc" = NOW()
WHERE "Id" = ':target_table_id'::uuid
  AND "TenantId" = ':tenant_id'::uuid
  AND "BranchId" = ':branch_id'::uuid;

-- =====================================================
-- D) CASE ITC_38.6: Tao dieu kien order Ready tren ban
-- Luu y: hien tai API /api/v1/tables khong tra "Yeu cau thanh toan".
-- Buoc nay dung de tai hien loi nghiep vu.
-- DB: S2O_Order_Db
-- =====================================================
UPDATE "Orders"
SET "Status" = 3
WHERE "TableId" = ':target_table_id'::uuid
  AND "TenantId" = ':tenant_id'::uuid
  AND "BranchId" = ':branch_id'::uuid
  AND "Status" IN (0, 1, 2)
  AND "DeletedAt" IS NULL;

-- Kiem tra nhanh
SELECT "Id", "Name", "IsActive", "IsOccupied"
FROM "Tables"
WHERE "TenantId" = ':tenant_id'::uuid
  AND "BranchId" = ':branch_id'::uuid
ORDER BY "Name";
