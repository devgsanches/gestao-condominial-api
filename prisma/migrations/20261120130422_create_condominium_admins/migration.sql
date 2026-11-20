-- CreateTable
CREATE TABLE "condominium_admins" (
    "id" TEXT NOT NULL,
    "condominium_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "condominium_admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "condominium_admins_condominium_id_admin_id_key" ON "condominium_admins"("condominium_id", "admin_id");

-- AddForeignKey
ALTER TABLE "condominium_admins" ADD CONSTRAINT "condominium_admins_condominium_id_fkey" FOREIGN KEY ("condominium_id") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condominium_admins" ADD CONSTRAINT "condominium_admins_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
