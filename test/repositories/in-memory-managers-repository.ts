import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { IManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import type { Manager } from '@/domain/management/enterprise/entities/manager'

export class InMemoryManagersRepository implements IManagersRepository {
	public items: Manager[] = []

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

	// async delete(id: UniqueEntityId) {
	// 	const managers = this.items.filter((item) => item.id !== id)

	// 	this.items = managers

	// 	return managers
	// }
}
