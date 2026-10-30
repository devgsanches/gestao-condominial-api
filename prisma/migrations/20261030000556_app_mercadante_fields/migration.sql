-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "condominiums" ADD COLUMN     "units_count" INTEGER;

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "supplier_cnpj" TEXT,
ADD COLUMN     "supplier_name" TEXT,
ADD COLUMN     "value_in_cents" INTEGER,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

UPDATE "contracts"
SET "supplier_name" = COALESCE("title", ''),
    "supplier_cnpj" = '',
    "value_in_cents" = 0;

ALTER TABLE "contracts" ALTER COLUMN "supplier_name" SET NOT NULL,
ALTER COLUMN "supplier_cnpj" SET NOT NULL,
ALTER COLUMN "value_in_cents" SET NOT NULL;

-- AlterTable
ALTER TABLE "maintenances" ADD COLUMN     "scheduled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "maintenances" SET "scheduled_at" = "created_at";

-- CreateTable
CREATE TABLE "auth_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_codes_email_idx" ON "auth_codes"("email");
