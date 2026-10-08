import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { IContractsRepository } from '@/domain/management/application/repositories/contracts-repository'
import type { Contract } from '@/domain/management/enterprise/entities/contract'

export class InMemoryContractsRepository implements IContractsRepository {
	public items: Contract[] = []

	async create(contract: Contract) {
		this.items.push(contract)
	}

	async findById(id: UniqueEntityId) {
		const contract = this.items.find((item) => item.id.equals(id))

		if (!contract) {
			return null
		}

		return contract
	}

	async delete(id: UniqueEntityId) {
		const contracts = this.items.filter((item) => !item.id.equals(id))

		this.items = contracts
	}
}
