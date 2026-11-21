import { UserRole } from '@generated/prisma/enums'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { AdminsRepository } from '@/domain/management/application/repositories/admins-repository'
import type { Admin } from '@/domain/management/enterprise/entities/admin'

interface CondominiumLink {
	adminId: UniqueEntityId
	condominiumId: UniqueEntityId
}

export class InMemoryAdminsRepository implements AdminsRepository {
	public items: Admin[] = []
	public condominiumLinks: CondominiumLink[] = []

	async create(admin: Admin) {
		this.items.push(admin)
	}

	async save(admin: Admin) {
		const adminIndex = this.items.findIndex((item) => item.id.equals(admin.id))

		this.items[adminIndex] = admin
	}

	async findById(id: UniqueEntityId) {
		const admin = this.items.find(
			(item) => item.id.equals(id) && item.role === UserRole.CONDOMINIUM_ADMIN,
		)

		if (!admin) {
			return null
		}

		return admin
	}

	async findByEmail(email: string) {
		const admin = this.items.find(
			(item) =>
				item.email === email && item.role === UserRole.CONDOMINIUM_ADMIN,
		)

		if (!admin) {
			return null
		}

		return admin
	}

	async findMany() {
		return this.items.filter(
			(item) => item.role === UserRole.CONDOMINIUM_ADMIN,
		)
	}

	async isAdminOfCondominium(
		adminId: UniqueEntityId,
		condominiumId: UniqueEntityId,
	) {
		return this.condominiumLinks.some(
			(link) =>
				link.adminId.equals(adminId) &&
				link.condominiumId.equals(condominiumId),
		)
	}

	async linkToCondominium(
		adminId: UniqueEntityId,
		condominiumId: UniqueEntityId,
	) {
		this.condominiumLinks.push({ adminId, condominiumId })
	}
}
