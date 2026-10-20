import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Manager } from '../../enterprise/entities/manager'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class ManagersRepository {
	abstract create(manager: Manager): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Manager | null>
	abstract findByEmail(email: string): Promise<Manager | null>
}
