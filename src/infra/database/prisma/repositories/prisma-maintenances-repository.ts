import { MaintenanceType, Prisma } from '@generated/prisma/client'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	MaintenancesFilters,
	MaintenancesRepository,
	PaginatedMaintenancesWithContract,
	PaginationParams,
} from '@/domain/management/application/repositories/maintenances-repository'
import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'
import { MaintenanceDetails } from '@/domain/management/enterprise/entities/value-objects/maintenance-details'
import {
	maintenanceDetailsInclude,
	PrismaMaintenanceDetailsMapper,
} from '../mappers/prisma-maintenance-details-mapper'
import { PrismaMaintenanceMapper } from '../mappers/prisma-maintenance-mapper'
import {
	maintenanceWithContractInclude,
	PrismaMaintenanceWithContractMapper,
} from '../mappers/prisma-maintenance-with-contract-mapper'
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

	async findDetailsById(
		id: UniqueEntityId,
	): Promise<MaintenanceDetails | null> {
		const maintenance = await this.prisma.maintenance.findUnique({
			where: {
				id: id.toValue(),
			},
			include: maintenanceDetailsInclude,
		})

		if (!maintenance) {
			return null
		}

		return PrismaMaintenanceDetailsMapper.toDomain(maintenance)
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
		pagination,
	}: {
		condominiumId: UniqueEntityId
		filters: MaintenancesFilters
		pagination: PaginationParams
	}): Promise<PaginatedMaintenancesWithContract> {
		const where: Prisma.MaintenanceWhereInput = {
			condominiumId: condominiumId.toValue(),
		}

		if (filters.title) {
			where.title = { contains: filters.title, mode: 'insensitive' }
		}

		if (filters.type) {
			where.type = filters.type
		}

		if (filters.withoutContract) {
			where.type = MaintenanceType.PERIODIC
			where.canceledAt = null
			where.contract = { is: null }
		}

		const [maintenances, total] = await this.prisma.$transaction([
			this.prisma.maintenance.findMany({
				where,
				include: maintenanceWithContractInclude,
				orderBy: [
					{ canceledAt: { sort: 'asc', nulls: 'first' } },
					{ createdAt: 'desc' },
				],
				skip: (pagination.page - 1) * pagination.perPage,
				take: pagination.perPage,
			}),
			this.prisma.maintenance.count({ where }),
		])

		return {
			maintenances: maintenances.map(
				PrismaMaintenanceWithContractMapper.toDomain,
			),
			total,
		}
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
