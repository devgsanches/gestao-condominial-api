import { Module } from '@nestjs/common'
import { AddressesRepository } from '@/domain/management/application/repositories/addresses-repository'
import { CondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
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
		PrismaMaintenancesRepository,
		PrismaContractsRepository,
		{
			provide: CondominiumsRepository,
			useClass: PrismaCondominiumsRepository,
		},
		PrismaAppointmentsRepository,
		{
			provide: AddressesRepository,
			useClass: PrismaAddressesRepository,
		},
	],
	exports: [
		PrismaService,
		ManagersRepository,
		PrismaMaintenancesRepository,
		PrismaContractsRepository,
		CondominiumsRepository,
		PrismaAppointmentsRepository,
		AddressesRepository,
	],
})
export class DatabaseModule {}
