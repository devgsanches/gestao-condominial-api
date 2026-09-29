import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Manager } from '../../enterprise/entities/manager'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface IManagersRepository {
	create(manager: Manager): Promise<void>
	findById(id: UniqueEntityId): Promise<Manager | null>
}
