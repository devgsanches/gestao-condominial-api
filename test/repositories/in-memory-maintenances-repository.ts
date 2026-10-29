import type { MaintenanceType } from '@generated/prisma/enums'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { MaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import type { Maintenance } from '@/domain/management/enterprise/entities/maintenance'
import { MaintenanceWithContract } from '@/domain/management/enterprise/entities/value-objects/maintenance-with-contract'

export class InMemoryMaintenancesRepository implements MaintenancesRepository {
	public items: Maintenance[] = []

	async create(maintenance: Maintenance) {
		this.items.push(maintenance)
	}

	async save(maintenance: Maintenance) {
		const maintenanceIndex = this.items.findIndex((item) =>
			item.id.equals(maintenance.id),
		)

		this.items[maintenanceIndex] = maintenance
	}

	async findManyByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: MaintenanceType }
	}) {
		return this.items
			.filter((i) => i.condominiumId.equals(condominiumId))
			.filter((i) => (filters.title ? i.title.includes(filters.title) : true))
			.filter((i) => (filters.type ? i.type === filters.type : true))
	}

	async findManyWithContractByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: MaintenanceType }
	}) {
		const maintenances = await this.findManyByCondominiumId({
			condominiumId,
			filters,
		})

		return maintenances.map((maintenance) =>
			MaintenanceWithContract.create({
				maintenanceId: maintenance.id,
				condominiumId: maintenance.condominiumId,
				type: maintenance.type,
				periodicity: maintenance.periodicity,
				contractId: null,
				title: maintenance.title,
				canceledAt: maintenance.canceledAt,
				createdAt: maintenance.createdAt,
				updatedAt: maintenance.updatedAt,
			}),
		)
	}

	async findById(id: UniqueEntityId) {
		const maintenance = this.items.find((item) => item.id.equals(id))

		if (!maintenance) {
			return null
		}

		return maintenance
	}

	async update(maintenance: Maintenance): Promise<Maintenance> {
		const maintenanceIndex = this.items.findIndex((item) =>
			item.id.equals(maintenance.id),
		)

		this.items[maintenanceIndex] = maintenance

		return this.items[maintenanceIndex]
	}

	async delete(id: UniqueEntityId) {
		const maintenances = this.items.filter((item) => !item.id.equals(id))

		this.items = maintenances
	}
}
