import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { IAddressesRepository } from '@/domain/management/application/repositories/addresses-repository'
import type { Address } from '@/domain/management/enterprise/entities/address'

export class InMemoryAddressesRepository implements IAddressesRepository {
	public items: Address[] = []

	async create(address: Address) {
		this.items.push(address)
	}

	async findById(id: UniqueEntityId) {
		const address = this.items.find((item) => item.id.equals(id))

		if (!address) {
			return null
		}

		return address
	}

	async delete(id: UniqueEntityId) {
		const addresses = this.items.filter((item) => !item.id.equals(id))

		this.items = addresses
	}
}
