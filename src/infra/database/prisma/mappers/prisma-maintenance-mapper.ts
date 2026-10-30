import {
	Prisma,
	Maintenance as PrismaMaintenance,
	MaintenanceType as PrismaMaintenanceType,
	MaintenancePeriodicity as PrismaPeriodicity,
} from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'

const typeToPrismaMap: Record<string, PrismaMaintenanceType> = {
	GENERAL: 'GENERAL',
	PERIODIC: 'PERIODIC',
}

const periodicityToDomainMap: Record<
	PrismaPeriodicity,
	'month' | 'trimester' | 'semester'
> = {
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
				type: raw.type,
				periodicity: raw.periodicity
					? periodicityToDomainMap[raw.periodicity]
					: null,
				title: raw.title,
				description: raw.description,
				scheduledAt: new Date(raw.scheduledAt),
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
			scheduledAt: maintenance.scheduledAt,
			canceledAt: maintenance.canceledAt,
			createdAt: maintenance.createdAt,
			updatedAt: maintenance.updatedAt,
		}
	}
}
