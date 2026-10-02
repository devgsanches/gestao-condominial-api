import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface ICondominiumsRepository {
	create(condominium: Condominium): Promise<void>
	findById(id: UniqueEntityId): Promise<Condominium | null>
	findManyByManagerId(managerId: UniqueEntityId): Promise<Condominium[]>
	findByManagerId(managerId: UniqueEntityId): Promise<Condominium | null>
	update(condominium: Pick<Condominium, 'name' | 'id'>): Promise<Condominium>
	delete(id: UniqueEntityId): Promise<void>
}
