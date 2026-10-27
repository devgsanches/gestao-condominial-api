import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ContractAttachmentsRepository } from '@/domain/management/application/repositories/contract-attachments-repository'
import type { ContractsRepository } from '@/domain/management/application/repositories/contracts-repository'
import type { Contract } from '@/domain/management/enterprise/entities/contract'

export class InMemoryContractsRepository implements ContractsRepository {
	constructor(
		private contractAttachmentsRepository: ContractAttachmentsRepository,
	) {}

	public items: Contract[] = []

	async create(contract: Contract) {
		this.items.push(contract)
	}

	async save(contract: Contract) {
		await this.contractAttachmentsRepository.createMany(
			contract.attachments.getNewItems(),
		)

		await this.contractAttachmentsRepository.deleteMany(
			contract.attachments.getRemovedItems(),
		)

		const contractIndex = this.items.findIndex((item) =>
			item.id.equals(contract.id),
		)

		this.items[contractIndex] = contract
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

	async findByMaintenanceId(maintenanceId: UniqueEntityId) {
		const contract = this.items.find((item) =>
			item.maintenanceId.equals(maintenanceId),
		)

		if (!contract) {
			return null
		}

		return contract
	}
}
