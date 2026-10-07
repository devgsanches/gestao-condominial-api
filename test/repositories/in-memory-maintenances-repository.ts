import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { IMaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import { MaintenanceType } from '@/domain/management/application/use-cases/fetch-maintenances'
import type { Maintenance } from '@/domain/management/enterprise/entities/maintenance'

export class InMemoryMaintenancesRepository implements IMaintenancesRepository {
	
	public items: Maintenance[] = []

	async create(maintenance: Maintenance) {
		this.items.push(maintenance)
	}

	async findManyByCondominiumId({ condominiumId, filters }: { condominiumId: UniqueEntityId, filters: { title?: string, type?: MaintenanceType } }) {
		return this.items
			.filter((i) => i.condominiumId.equals(condominiumId))
			.filter((i) => (filters.title ? i.title.includes(filters.title) : true))
			.filter((i) => (filters.type ? i.type === filters.type : true))
	}

	async findById(id: UniqueEntityId) {
		const maintenance = this.items.find((item) => item.id.equals(id))

		if (!maintenance) {
			return null
		}

		return maintenance
	}

	async update(maintenance: Maintenance): Promise<Maintenance> {
		const maintenanceIndex = this.items.findIndex((item) => item.id.equals(maintenance.id))

		this.items[maintenanceIndex] = maintenance

		return this.items[maintenanceIndex]
	}
	

	async delete(id: UniqueEntityId) {
		const maintenances = this.items.filter((item) => !item.id.equals(id))

		this.items = maintenances
	}
}
