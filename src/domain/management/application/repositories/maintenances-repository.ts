import { MaintenanceType } from '@generated/prisma/enums'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { MaintenanceWithContract } from '../../enterprise/entities/value-objects/maintenance-with-contract'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class MaintenancesRepository {
	abstract create(maintenance: Maintenance): Promise<void>
	abstract save(maintenance: Maintenance): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Maintenance | null>
	abstract findManyByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: MaintenanceType }
	}): Promise<Maintenance[]>
	abstract findManyWithContractByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: MaintenanceType }
	}): Promise<MaintenanceWithContract[]>
	abstract update(maintenance: Maintenance): Promise<Maintenance>
	abstract delete(id: UniqueEntityId): Promise<void>
}
