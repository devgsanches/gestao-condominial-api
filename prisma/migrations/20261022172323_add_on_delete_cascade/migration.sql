-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_condominium_id_fkey";

-- DropForeignKey
ALTER TABLE "condominium_finance" DROP CONSTRAINT "condominium_finance_condominium_id_fkey";

-- DropForeignKey
ALTER TABLE "condominium_finance" DROP CONSTRAINT "condominium_finance_finance_id_fkey";

-- DropForeignKey
ALTER TABLE "condominiums" DROP CONSTRAINT "condominiums_address_id_fkey";

-- DropForeignKey
ALTER TABLE "condominiums" DROP CONSTRAINT "condominiums_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_maintenance_id_fkey";

-- DropForeignKey
ALTER TABLE "contracts_attachments" DROP CONSTRAINT "contracts_attachments_attachment_id_fkey";

-- DropForeignKey
ALTER TABLE "contracts_attachments" DROP CONSTRAINT "contracts_attachments_contract_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_condominium_id_fkey";

-- AddForeignKey
ALTER TABLE "condominiums" ADD CONSTRAINT "condominiums_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condominiums" ADD CONSTRAINT "condominiums_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_condominium_id_fkey" FOREIGN KEY ("condominium_id") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_condominium_id_fkey" FOREIGN KEY ("condominium_id") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condominium_finance" ADD CONSTRAINT "condominium_finance_condominium_id_fkey" FOREIGN KEY ("condominium_id") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condominium_finance" ADD CONSTRAINT "condominium_finance_finance_id_fkey" FOREIGN KEY ("finance_id") REFERENCES "finances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts_attachments" ADD CONSTRAINT "contracts_attachments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts_attachments" ADD CONSTRAINT "contracts_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
