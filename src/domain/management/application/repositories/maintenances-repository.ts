import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { MaintenanceType } from '../use-cases/fetch-maintenances'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class MaintenancesRepository {
	abstract create(maintenance: Maintenance): Promise<void>
	abstract save(maintenance: Maintenance): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Maintenance | null>
	abstract findManyByCondominiumId({ condominiumId, filters }: { condominiumId: UniqueEntityId, filters: { title?: string, type?: MaintenanceType } }): Promise<Maintenance[]>
	abstract update(maintenance: Maintenance): Promise<Maintenance>
	abstract delete(id: UniqueEntityId): Promise<void>
}
