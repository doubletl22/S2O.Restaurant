-- Migration: Add default values for IsAvailable and IsActive in Products table
-- This fixes the NOT NULL constraint violation errors

-- Step 1: Set default value for IsAvailable column
ALTER TABLE "Products" 
ALTER COLUMN "IsAvailable" SET DEFAULT true;

-- Step 2: Set default value for IsActive column  
ALTER TABLE "Products" 
ALTER COLUMN "IsActive" SET DEFAULT true;

-- Step 3: Update any existing NULL values to true
UPDATE "Products" 
SET "IsAvailable" = true 
WHERE "IsAvailable" IS NULL;

UPDATE "Products" 
SET "IsActive" = true 
WHERE "IsActive" IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    is_nullable,
    column_default 
FROM information_schema.columns 
WHERE table_name = 'Products' 
  AND column_name IN ('IsAvailable', 'IsActive')
ORDER BY column_name;
