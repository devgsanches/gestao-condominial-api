import { MaintenanceType } from '@generated/prisma/enums'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { MaintenanceDetails } from '../../enterprise/entities/value-objects/maintenance-details'
import { MaintenanceWithContract } from '../../enterprise/entities/value-objects/maintenance-with-contract'

export interface MaintenancesFilters {
	title?: string
	type?: MaintenanceType
	withoutContract?: boolean
}

export interface PaginationParams {
	page: number
	perPage: number
}

export interface PaginatedMaintenancesWithContract {
	maintenances: MaintenanceWithContract[]
	total: number
}

export abstract class MaintenancesRepository {
	abstract create(maintenance: Maintenance): Promise<void>
	abstract save(maintenance: Maintenance): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Maintenance | null>
	abstract findDetailsById(
		id: UniqueEntityId,
	): Promise<MaintenanceDetails | null>
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
		pagination,
	}: {
		condominiumId: UniqueEntityId
		filters: MaintenancesFilters
		pagination: PaginationParams
	}): Promise<PaginatedMaintenancesWithContract>
	abstract update(maintenance: Maintenance): Promise<Maintenance>
	abstract delete(id: UniqueEntityId): Promise<void>
}
