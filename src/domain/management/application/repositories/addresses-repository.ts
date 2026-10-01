import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '../../enterprise/entities/address'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface IAddressesRepository {
	create(address: Address): Promise<void>
	findById(id: UniqueEntityId): Promise<Address | null>
	delete(id: UniqueEntityId): Promise<void>
}
