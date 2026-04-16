ALTER TABLE "Tenants"
ADD COLUMN IF NOT EXISTS "LockReason" text NULL;

ALTER TABLE "Tenants"
ADD COLUMN IF NOT EXISTS "LockedAtUtc" timestamp without time zone NULL;

ALTER TABLE "Tenants"
ADD COLUMN IF NOT EXISTS "LockedUntilUtc" timestamp without time zone NULL;
