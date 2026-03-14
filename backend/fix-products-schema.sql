-- Fix database schema for IsAvailable and IsActive columns
-- This adds DEFAULT values to prevent NOT NULL constraint violations

-- Set default value for IsAvailable
ALTER TABLE "Products" 
ALTER COLUMN "IsAvailable" SET DEFAULT true;

-- Set default value for IsActive  
ALTER TABLE "Products" 
ALTER COLUMN "IsActive" SET DEFAULT true;

-- Update any existing NULL values (if any)
UPDATE "Products" 
SET "IsAvailable" = true 
WHERE "IsAvailable" IS NULL;

UPDATE "Products" 
SET "IsActive" = true 
WHERE "IsActive" IS NULL;

-- Verify the changes
SELECT column_name, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Products' 
  AND column_name IN ('IsAvailable', 'IsActive');
