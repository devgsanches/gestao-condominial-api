import { MaintenanceType } from '@generated/prisma/client'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { MaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'
import { MaintenanceWithContract } from '@/domain/management/enterprise/entities/value-objects/maintenance-with-contract'
import { PrismaMaintenanceMapper } from '../mappers/prisma-maintenance-mapper'
import { PrismaMaintenanceWithContractMapper } from '../mappers/prisma-maintenance-with-contract-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaMaintenancesRepository implements MaintenancesRepository {
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
			where.type = filters.type
		}

		const maintenances = await this.prisma.maintenance.findMany({
			where: {
				...where,
				canceledAt: null,
			},
		})

		return maintenances.map(PrismaMaintenanceMapper.toDomain)
	}

	async findManyWithContractByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: MaintenanceType }
	}): Promise<MaintenanceWithContract[]> {
		const where: Record<string, unknown> = {
			condominiumId: condominiumId.toValue(),
		}

		if (filters.title) {
			where.title = { contains: filters.title, mode: 'insensitive' }
		}

		if (filters.type) {
			where.type = filters.type
		}

		const maintenances = await this.prisma.maintenance.findMany({
			where: {
				...where,
				canceledAt: null,
			},
			include: {
				contract: {
					select: {
						id: true,
					},
				},
			},
		})

		// call the mapper
		return maintenances.map(PrismaMaintenanceWithContractMapper.toDomain)
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
