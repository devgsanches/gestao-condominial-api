import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { MaintenanceType } from '../use-cases/fetch-maintenances'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface IMaintenancesRepository {
	create(maintenance: Maintenance): Promise<void>
	findById(id: UniqueEntityId): Promise<Maintenance | null>
	findManyByCondominiumId({ condominiumId, filters }: { condominiumId: UniqueEntityId, filters: { title?: string, type?: MaintenanceType } }): Promise<Maintenance[]>
	delete(id: UniqueEntityId): Promise<void>
}
