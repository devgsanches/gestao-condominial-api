import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import type { CondominiumWithAddress } from '../interfaces/condominium'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class CondominiumsRepository {
	abstract create(condominium: Condominium): Promise<void>
	abstract findByName(name: string): Promise<Condominium | null>
	abstract findById(id: UniqueEntityId): Promise<Condominium | null>
	abstract findManyByManagerId(managerId: UniqueEntityId): Promise<Condominium[]>
	abstract findManyWithAddressByManagerId(
		managerId: UniqueEntityId,
	): Promise<CondominiumWithAddress[]>
	abstract findByManagerId(managerId: UniqueEntityId): Promise<Condominium | null>
	abstract findByAddressId(addressId: UniqueEntityId): Promise<Condominium | null>
	abstract update(condominium: Pick<Condominium, 'name' | 'id'>): Promise<Condominium>
	abstract delete(id: UniqueEntityId): Promise<void>
}
