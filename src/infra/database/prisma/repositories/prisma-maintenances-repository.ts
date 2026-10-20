import { MaintenanceType as PrismaMaintenanceType } from '@generated/prisma/client'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IMaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import { MaintenanceType } from '@/domain/management/application/use-cases/fetch-maintenances'
import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'
import { PrismaMaintenanceMapper } from '../mappers/prisma-maintenance-mapper'
import { PrismaService } from '../prisma.service'

const typeToPrismaMap: Record<string, PrismaMaintenanceType> = {
	general: 'GENERAL',
	periodic: 'PERIODIC',
}

@Injectable()
export class PrismaMaintenancesRepository implements IMaintenancesRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(maintenance: Maintenance): Promise<void> {
		const maintenancePrisma = PrismaMaintenanceMapper.toPrisma(maintenance)

		await this.prisma.maintenance.create({
			data: {
				...maintenancePrisma,
			},
		})
	}

	async save(maintenance: Maintenance): Promise<void> {
		const maintenancePrisma = PrismaMaintenanceMapper.toPrisma(maintenance)

		await this.prisma.maintenance.update({
			where: {
				id: maintenance.id.toValue(),
			},
			data: {
				...maintenancePrisma,
			},
		})
	}

	async findById(id: UniqueEntityId): Promise<Maintenance | null> {
		const maintenance = await this.prisma.maintenance.findUnique({
			where: {
				id: id.toValue(),
			},
		})

		if (!maintenance) {
			return null
		}

		return PrismaMaintenanceMapper.toDomain(maintenance)
	}

	async findManyByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: MaintenanceType }
	}): Promise<Maintenance[]> {
		const where: Record<string, unknown> = {
			condominiumId: condominiumId.toValue(),
		}

		if (filters.title) {
			where.title = { contains: filters.title, mode: 'insensitive' }
		}

		if (filters.type) {
			where.type = typeToPrismaMap[filters.type]
		}

		const maintenances = await this.prisma.maintenance.findMany({ where })

		return maintenances.map(PrismaMaintenanceMapper.toDomain)
	}

	async update(maintenance: Maintenance): Promise<Maintenance> {
		const maintenancePrisma = PrismaMaintenanceMapper.toPrisma(maintenance)

		const updated = await this.prisma.maintenance.update({
			where: {
				id: maintenance.id.toValue(),
			},
			data: {
				...maintenancePrisma,
			},
		})

		return PrismaMaintenanceMapper.toDomain(updated)
	}

	async delete(id: UniqueEntityId): Promise<void> {
		await this.prisma.maintenance.delete({
			where: {
				id: id.toValue(),
			},
		})
	}
}
