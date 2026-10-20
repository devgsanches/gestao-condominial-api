import {
	Maintenance as PrismaMaintenance,
	MaintenancePeriodicity as PrismaPeriodicity,
	MaintenanceType as PrismaMaintenanceType,
	Prisma,
} from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'

const typeToDoaminMap: Record<PrismaMaintenanceType, 'general' | 'periodic'> = {
	GENERAL: 'general',
	PERIODIC: 'periodic',
}

const typeToPrismaMap: Record<string, PrismaMaintenanceType> = {
	general: 'GENERAL',
	periodic: 'PERIODIC',
}

const periodicityToDomainMap: Record<PrismaPeriodicity, 'month' | 'trimester' | 'semester'> = {
	MONTH: 'month',
	TRIMESTER: 'trimester',
	SEMESTER: 'semester',
}

const periodicityToPrismaMap: Record<string, PrismaPeriodicity> = {
	month: 'MONTH',
	trimester: 'TRIMESTER',
	semester: 'SEMESTER',
}

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaMaintenanceMapper {
	static toDomain(raw: PrismaMaintenance): Maintenance {
		return Maintenance.create(
			{
				condominiumId: new UniqueEntityId(raw.condominiumId),
				type: typeToDoaminMap[raw.type],
				periodicity: raw.periodicity
					? periodicityToDomainMap[raw.periodicity]
					: null,
				title: raw.title,
				description: raw.description,
				canceledAt: raw.canceledAt ?? undefined,
				createdAt: new Date(raw.createdAt),
				updatedAt: raw.updatedAt ?? undefined,
			},
			new UniqueEntityId(raw.id),
		)
	}

	static toPrisma(
		maintenance: Maintenance,
	): Prisma.MaintenanceUncheckedCreateInput {
		return {
			id: maintenance.id.toString(),
			condominiumId: maintenance.condominiumId.toString(),
			type: typeToPrismaMap[maintenance.type],
			periodicity: maintenance.periodicity
				? periodicityToPrismaMap[maintenance.periodicity]
				: undefined,
			title: maintenance.title,
			description: maintenance.description,
			canceledAt: maintenance.canceledAt,
			createdAt: maintenance.createdAt,
			updatedAt: maintenance.updatedAt,
		}
	}
}
