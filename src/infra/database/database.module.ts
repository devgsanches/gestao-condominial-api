import { Module } from '@nestjs/common'
import { AddressesRepository } from '@/domain/management/application/repositories/addresses-repository'
import { AppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import { CondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import { ContractsRepository } from '@/domain/management/application/repositories/contracts-repository'
import { MaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import { ManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import { PrismaService } from './prisma/prisma.service'
import { PrismaAddressesRepository } from './prisma/repositories/prisma-addresses-repository'
import { PrismaAppointmentsRepository } from './prisma/repositories/prisma-appointments-repository'
import { PrismaCondominiumsRepository } from './prisma/repositories/prisma-condominiums-repository'
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
	],
	exports: [
		PrismaService,
		ManagersRepository,
		MaintenancesRepository,
		ContractsRepository,
		CondominiumsRepository,
		AppointmentsRepository,
		AddressesRepository,
	],
})
export class DatabaseModule {}
