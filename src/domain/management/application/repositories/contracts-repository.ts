import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Contract } from '../../enterprise/entities/contract'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface IContractsRepository {
	create(contract: Contract): Promise<void>
	findById(id: UniqueEntityId): Promise<Contract | null>
	delete(id: UniqueEntityId): Promise<void>
}
