import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { CondominiumDashboard } from '../../enterprise/entities/value-objects/condominium-dashboard'
import { CondominiumWithAddress } from '../../enterprise/entities/value-objects/condominium-with-address'

// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class CondominiumsRepository {
	abstract create(condominium: Condominium): Promise<void>
	abstract findByName(name: string): Promise<Condominium | null>
	abstract findById(id: UniqueEntityId): Promise<Condominium | null>
	abstract findManyByManagerId(
		managerId: UniqueEntityId,
	): Promise<Condominium[]>
	abstract findManyWithAddressByManagerId(
		managerId: UniqueEntityId,
	): Promise<CondominiumWithAddress[]>
	abstract findManyWithAddressByAdminId(
		adminId: UniqueEntityId,
	): Promise<CondominiumWithAddress[]>
	abstract findByManagerId(
		managerId: UniqueEntityId,
	): Promise<Condominium | null>
	abstract findByAddressId(
		addressId: UniqueEntityId,
	): Promise<Condominium | null>
	abstract findDashboardbyCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<CondominiumDashboard | null>
	abstract update(
		condominium: Pick<Condominium, 'name' | 'id' | 'unitsCount'>,
	): Promise<Condominium>
	abstract delete(id: UniqueEntityId): Promise<void>
}
