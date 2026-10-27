import { Module } from '@nestjs/common'
import { AddressesRepository } from '@/domain/management/application/repositories/addresses-repository'
import { AppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import { AttachmentsRepository } from '@/domain/management/application/repositories/attachments-repository'
import { CondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import { ContractAttachmentsRepository } from '@/domain/management/application/repositories/contract-attachments-repository'
import { ContractsRepository } from '@/domain/management/application/repositories/contracts-repository'
import { MaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import { ManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import { PrismaService } from './prisma/prisma.service'
import { PrismaAddressesRepository } from './prisma/repositories/prisma-addresses-repository'
import { PrismaAppointmentsRepository } from './prisma/repositories/prisma-appointments-repository'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'
import { PrismaCondominiumsRepository } from './prisma/repositories/prisma-condominiums-repository'
import { PrismaContractAttachmentsRepository } from './prisma/repositories/prisma-contract-attachments-repository'
import { PrismaContractsRepository } from './prisma/repositories/prisma-contracts-repository'
import { PrismaMaintenancesRepository } from './prisma/repositories/prisma-maintenances-repository'
import { PrismaManagersRepository } from './prisma/repositories/prisma-managers-repository'

@Module({
	providers: [
		PrismaService,
		{
			provide: ManagersRepository,
			useClass: PrismaManagersRepository,
		},
		{
			provide: MaintenancesRepository,
			useClass: PrismaMaintenancesRepository,
		},
		{
			provide: ContractsRepository,
			useClass: PrismaContractsRepository,
		},
		{
			provide: CondominiumsRepository,
			useClass: PrismaCondominiumsRepository,
		},
		{
			provide: AppointmentsRepository,
			useClass: PrismaAppointmentsRepository,
		},
		{
			provide: AddressesRepository,
			useClass: PrismaAddressesRepository,
		},
		{
			provide: AttachmentsRepository,
			useClass: PrismaAttachmentsRepository,
		},
		{
			provide: ContractAttachmentsRepository,
			useClass: PrismaContractAttachmentsRepository,
		},
	],
	exports: [
		PrismaService,
		ManagersRepository,
		MaintenancesRepository,
		ContractsRepository,
		CondominiumsRepository,
		AppointmentsRepository,
		AddressesRepository,
		AttachmentsRepository,
		ContractAttachmentsRepository,
	],
})
export class DatabaseModule {}
