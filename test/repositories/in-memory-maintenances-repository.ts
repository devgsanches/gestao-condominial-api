import { MaintenanceType } from '@generated/prisma/enums'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type {
	MaintenancesFilters,
	MaintenancesRepository,
	PaginationParams,
} from '@/domain/management/application/repositories/maintenances-repository'
import type { Attachment } from '@/domain/management/enterprise/entities/attachment'
import type { Maintenance } from '@/domain/management/enterprise/entities/maintenance'
import { MaintenanceDetails } from '@/domain/management/enterprise/entities/value-objects/maintenance-details'
import { MaintenanceWithContract } from '@/domain/management/enterprise/entities/value-objects/maintenance-with-contract'
import type { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'
import type { InMemoryContractsRepository } from './in-memory-contracts-repository'

export class InMemoryMaintenancesRepository implements MaintenancesRepository {
	public items: Maintenance[] = []

	constructor(
		private contractsRepository?: InMemoryContractsRepository,
		private attachmentsRepository?: InMemoryAttachmentsRepository,
	) {}

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
		pagination,
	}: {
		condominiumId: UniqueEntityId
		filters: MaintenancesFilters
		pagination: PaginationParams
	}) {
		const maintenances = (
			await this.findManyByCondominiumId({ condominiumId, filters })
		)
			.map((maintenance) => {
				const contract = this.contractsRepository?.items.find((item) =>
					item.maintenanceId.equals(maintenance.id),
				)

				return MaintenanceWithContract.create({
					maintenanceId: maintenance.id,
					condominiumId: maintenance.condominiumId,
					type: maintenance.type,
					periodicity: maintenance.periodicity,
					contractId: contract?.id ?? null,
					contractIsValid: contract?.isValid ?? null,
					title: maintenance.title,
					scheduledAt: maintenance.scheduledAt,
					canceledAt: maintenance.canceledAt,
					createdAt: maintenance.createdAt,
					updatedAt: maintenance.updatedAt,
				})
			})
			.filter((maintenance) =>
				filters.withoutContract
					? maintenance.type === MaintenanceType.PERIODIC &&
						!maintenance.canceledAt &&
						!maintenance.contractId
					: true,
			)
			.sort((a, b) => {
				if (!a.canceledAt !== !b.canceledAt) {
					return a.canceledAt ? 1 : -1
				}

				return b.createdAt.getTime() - a.createdAt.getTime()
			})

		const start = (pagination.page - 1) * pagination.perPage

		return {
			maintenances: maintenances.slice(start, start + pagination.perPage),
			total: maintenances.length,
		}
	}

	async findById(id: UniqueEntityId) {
		const maintenance = this.items.find((item) => item.id.equals(id))

		if (!maintenance) {
			return null
		}

		return maintenance
	}

	async findDetailsById(id: UniqueEntityId) {
		const maintenance = await this.findById(id)

		if (!maintenance) {
			return null
		}

		const contract =
			this.contractsRepository?.items.find((item) =>
				item.maintenanceId.equals(maintenance.id),
			) ?? null

		const attachments = (contract?.attachments.currentItems ?? [])
			.map((contractAttachment) =>
				this.attachmentsRepository?.items.find((attachment) =>
					attachment.id.equals(contractAttachment.attachmentId),
				),
			)
			.filter((attachment): attachment is Attachment => !!attachment)

		return MaintenanceDetails.create({ maintenance, contract, attachments })
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
