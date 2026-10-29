/*
  Warnings:

  - A unique constraint covering the columns `[condominium_id,scheduled_at]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "appointments_condominium_id_scheduled_at_key" ON "appointments"("condominium_id", "scheduled_at") WHERE ("canceled_at" IS NULL);
