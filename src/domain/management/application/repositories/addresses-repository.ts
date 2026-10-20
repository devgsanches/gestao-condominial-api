import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '../../enterprise/entities/address'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class AddressesRepository {
	abstract create(address: Address): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Address | null>
	abstract delete(id: UniqueEntityId): Promise<void>
}
