import { Module } from '@nestjs/common'
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
		PrismaManagersRepository,
		PrismaMaintenancesRepository,
		PrismaContractsRepository,
		PrismaCondominiumsRepository,
		PrismaAppointmentsRepository,
		PrismaAddressesRepository,
	],
	exports: [
		PrismaService,
		PrismaManagersRepository,
		PrismaMaintenancesRepository,
		PrismaContractsRepository,
		PrismaCondominiumsRepository,
		PrismaAppointmentsRepository,
		PrismaAddressesRepository,
	],
})
export class DatabaseModule {}
