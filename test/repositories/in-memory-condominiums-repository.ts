import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { CondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import type { Condominium } from '@/domain/management/enterprise/entities/condominium'
import { CondominiumWithAddress } from '@/domain/management/enterprise/entities/value-objects/condominium-with-address'
import type { InMemoryAddressesRepository } from './in-memory-addresses-repository'

export class InMemoryCondominiumsRepository implements CondominiumsRepository {
	public items: Condominium[] = []

	constructor(private addressesRepository?: InMemoryAddressesRepository) {}

	async create(condominium: Condominium) {
		this.items.push(condominium)
	}

	async findById(id: UniqueEntityId) {
		const condominium = this.items.find((item) => item.id === id)

		if (!condominium) {
			return null
		}

		return condominium
	}

	async findByName(name: string) {
		const condominium = this.items.find((item) => item.name === name)

		if (!condominium) {
			return null
		}

		return condominium
	}

	async findByManagerId(managerId: UniqueEntityId) {
		const condominium = this.items.find((item) =>
			item.managerId.equals(managerId),
		)

		if (!condominium) {
			return null
		}

		return condominium
	}

	async findByAddressId(addressId: UniqueEntityId) {
		const condominium = this.items.find((item) =>
			item.addressId.equals(addressId),
		)

		if (!condominium) {
			return null
		}

		return condominium
	}

	async findManyByManagerId(managerId: UniqueEntityId) {
		const condominiums = this.items.filter((item) =>
			item.managerId.equals(managerId),
		)

		if (condominiums.length === 0) {
			return []
		}

		return condominiums
	}

	async findManyWithAddressByManagerId(
		managerId: UniqueEntityId,
	): Promise<CondominiumWithAddress[]> {
		const condominiums = this.items.filter((item) =>
			item.managerId.equals(managerId),
		)

		return condominiums.map((condominium) => {
			const address = this.addressesRepository?.items.find((item) =>
				item.id.equals(condominium.addressId),
			)

			if (!address) {
				throw new Error(
					`Address with ID "${condominium.addressId.toString()}" does not exist.`,
				)
			}

			return CondominiumWithAddress.create({
				condominium,
				address: {
					id: address.id,
					city: address.city,
				},
			})
		})
	}

	async update(
		condominium: Pick<Condominium, 'name' | 'id'>,
	): Promise<Condominium> {
		const condominiumIndex = this.items.findIndex((i) =>
			i.id.equals(condominium.id),
		)

		this.items[condominiumIndex].name = condominium.name

		return this.items[condominiumIndex]
	}

	async delete(id: UniqueEntityId): Promise<void> {
		const validCondominiums = this.items.filter((item) => !item.id.equals(id))

		this.items = validCondominiums
	}
}
