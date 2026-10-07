import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { IMaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import type { Maintenance } from '@/domain/management/enterprise/entities/maintenance'

export class InMemoryMaintenancesRepository implements IMaintenancesRepository {
	public items: Maintenance[] = []

	async create(maintenance: Maintenance) {
		this.items.push(maintenance)
	}

	async findById(id: UniqueEntityId) {
		const maintenance = this.items.find((item) => item.id.equals(id))

		if (!maintenance) {
			return null
		}

		return maintenance
	}

	async delete(id: UniqueEntityId) {
		const maintenances = this.items.filter((item) => !item.id.equals(id))

		this.items = maintenances
	}
}
