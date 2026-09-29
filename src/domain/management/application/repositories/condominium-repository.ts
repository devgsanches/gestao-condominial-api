import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface ICondominiumRepository {
	create(condominium: Condominium): Promise<void>
	findById(id: UniqueEntityId): Promise<Condominium | null>
}
