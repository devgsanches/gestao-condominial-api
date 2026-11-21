import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Admin } from '../../enterprise/entities/admin'

export abstract class AdminsRepository {
	abstract create(admin: Admin): Promise<void>
	abstract save(admin: Admin): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Admin | null>
	abstract findByEmail(email: string): Promise<Admin | null>
	abstract findMany(): Promise<Admin[]>
	abstract isAdminOfCondominium(
		adminId: UniqueEntityId,
		condominiumId: UniqueEntityId,
	): Promise<boolean>
	abstract linkToCondominium(
		adminId: UniqueEntityId,
		condominiumId: UniqueEntityId,
	): Promise<void>
}
