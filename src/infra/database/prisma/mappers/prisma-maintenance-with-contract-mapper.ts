import { Prisma } from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { MaintenanceWithContract } from '@/domain/management/enterprise/entities/value-objects/maintenance-with-contract'

export const maintenanceWithContractInclude = {
	contract: {
		select: {
			id: true,
			isValid: true,
		},
	},
} satisfies Prisma.MaintenanceInclude

type PrismaMaintenanceWithContract = Prisma.MaintenanceGetPayload<{
	include: typeof maintenanceWithContractInclude
}>

const periodicityToDomainMap = {
	MONTH: 'month',
	TRIMESTER: 'trimester',
	SEMESTER: 'semester',
} as const

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaMaintenanceWithContractMapper {
	static toDomain(raw: PrismaMaintenanceWithContract): MaintenanceWithContract {
		return MaintenanceWithContract.create({
			maintenanceId: new UniqueEntityId(raw.id),
			condominiumId: new UniqueEntityId(raw.condominiumId),
			type: raw.type,
			periodicity: raw.periodicity
				? periodicityToDomainMap[raw.periodicity]
				: null,
			contractId: raw.contract ? new UniqueEntityId(raw.contract.id) : null,
			contractIsValid: raw.contract ? raw.contract.isValid : null,
			title: raw.title,
			scheduledAt: new Date(raw.scheduledAt),
			canceledAt: raw.canceledAt ?? undefined,
			createdAt: new Date(raw.createdAt),
			updatedAt: raw.updatedAt ?? undefined,
		})
	}
}
