import { Module } from '@nestjs/common'
import { AddressesRepository } from '@/domain/management/application/repositories/addresses-repository'
import { AdminsRepository } from '@/domain/management/application/repositories/admins-repository'
import { AppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import { AttachmentsRepository } from '@/domain/management/application/repositories/attachments-repository'
import { AuthCodesRepository } from '@/domain/management/application/repositories/auth-codes-repository'
import { CondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import { ContractAttachmentsRepository } from '@/domain/management/application/repositories/contract-attachments-repository'
import { ContractsRepository } from '@/domain/management/application/repositories/contracts-repository'
import { MaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import { ManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import { CacheModule } from '../cache/cache.module'
import { PrismaService } from './prisma/prisma.service'
import { PrismaAddressesRepository } from './prisma/repositories/prisma-addresses-repository'
import { PrismaAdminsRepository } from './prisma/repositories/prisma-admins-repository'
import { PrismaAppointmentsRepository } from './prisma/repositories/prisma-appointments-repository'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'
import { PrismaAuthCodesRepository } from './prisma/repositories/prisma-auth-codes-repository'
import { PrismaCondominiumsRepository } from './prisma/repositories/prisma-condominiums-repository'
import { PrismaContractAttachmentsRepository } from './prisma/repositories/prisma-contract-attachments-repository'
import { PrismaContractsRepository } from './prisma/repositories/prisma-contracts-repository'
import { PrismaMaintenancesRepository } from './prisma/repositories/prisma-maintenances-repository'
import { PrismaManagersRepository } from './prisma/repositories/prisma-managers-repository'

@Module({
	imports: [CacheModule],
	providers: [
		PrismaService,
		{
			provide: ManagersRepository,
			useClass: PrismaManagersRepository,
		},
		{
			provide: AdminsRepository,
			useClass: PrismaAdminsRepository,
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
		{
			provide: AuthCodesRepository,
			useClass: PrismaAuthCodesRepository,
		},
	],
	exports: [
		PrismaService,
		ManagersRepository,
		AdminsRepository,
		MaintenancesRepository,
		ContractsRepository,
		CondominiumsRepository,
		AppointmentsRepository,
		AddressesRepository,
		AttachmentsRepository,
		ContractAttachmentsRepository,
		AuthCodesRepository,
	],
})
export class DatabaseModule {}
