import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import type { Manager } from '@/domain/management/enterprise/entities/manager'
import { ManagerWithCondominiums } from '@/domain/management/enterprise/entities/value-objects/manager-with-condominiums'
import { InMemoryAddressesRepository } from './in-memory-addresses-repository'
import { InMemoryCondominiumsRepository } from './in-memory-condominiums-repository'

export class InMemoryManagersRepository implements ManagersRepository {
	public items: Manager[] = []

	constructor(
		private condominiumsRepository: InMemoryCondominiumsRepository,
		private addressesRepository: InMemoryAddressesRepository,
	) {}

	async create(manager: Manager) {
		this.items.push(manager)
	}

	async findById(id: UniqueEntityId) {
		const manager = this.items.find((item) => item.id.equals(id))

		if (!manager) {
			return null
		}

		return manager
	}

	async findByEmail(email: string) {
		const manager = this.items.find((item) => item.email === email)

		if (!manager) {
			return null
		}

		return manager
	}

	async findManagerWithCondominiums(id: UniqueEntityId) {
		const manager = this.items.find((item) => item.id.equals(id))

		if (!manager) {
			return null
		}

		const condominiums = this.condominiumsRepository.items
			.filter((item) => item.managerId.equals(id))
			.map((condominium) => {
				const address = this.addressesRepository.items.find((item) =>
					item.id.equals(condominium.addressId),
				)

				if (!address) {
					throw new Error(
						`Address with ID "${condominium.addressId.toString()}" does not exist.`,
					)
				}

				return {
					condominiumId: condominium.id,
					name: condominium.name,
					address: {
						id: address.id,
						city: address.city,
					},
					createdAt: condominium.createdAt,
					updatedAt: condominium.updatedAt,
				}
			})

		return ManagerWithCondominiums.create({
			managerId: manager.id,
			name: manager.name,
			email: manager.email,
			condominiums,
			createdAt: manager.createdAt,
			updatedAt: manager.updatedAt,
		})
	}
}
