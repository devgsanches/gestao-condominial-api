import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface IMaintenancesRepository {
	create(maintenance: Maintenance): Promise<void>
	findById(id: UniqueEntityId): Promise<Maintenance | null>
	delete(id: UniqueEntityId): Promise<void>
}
