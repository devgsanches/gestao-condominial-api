import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'
import { MaintenanceDetails } from '@/domain/management/enterprise/entities/value-objects/maintenance-details'
import { MaintenanceWithContract } from '@/domain/management/enterprise/entities/value-objects/maintenance-with-contract'
import { ContractPresenter, toContractStatus } from './contract-presenter'

export interface PaginationMeta {
	page: number
	perPage: number
	total: number
}

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class MaintenancePresenter {
	static toHTTP(maintenance: Maintenance) {
		return {
			maintenance: MaintenancePresenter.toHTTPItem(maintenance),
		}
	}

	static toHTTPDetails(details: MaintenanceDetails) {
		return {
			maintenance: {
				...MaintenancePresenter.toHTTPItem(details.maintenance),
				contract: details.contract
					? ContractPresenter.toHTTPItem(details.contract, details.attachments)
					: null,
			},
		}
	}

	static toHTTPList(
		maintenances: MaintenanceWithContract[],
		meta: PaginationMeta,
	) {
		return {
			maintenances: maintenances.map((maintenance) => ({
				id: maintenance.maintenanceId.toString(),
				condominiumId: maintenance.condominiumId.toString(),
				type: maintenance.type,
				periodicity: maintenance.periodicity,
				contractId: maintenance.contractId
					? maintenance.contractId.toString()
					: null,
				contractStatus:
					maintenance.contractIsValid === null
						? null
						: toContractStatus(maintenance.contractIsValid),
				title: maintenance.title,
				scheduledAt: maintenance.scheduledAt,
				canceledAt: maintenance.canceledAt,
				created_at: maintenance.createdAt,
				updated_at: maintenance.updatedAt,
			})),
			meta,
		}
	}

	private static toHTTPItem(maintenance: Maintenance) {
		return {
			id: maintenance.id.toString(),
			condominiumId: maintenance.condominiumId.toString(),
			type: maintenance.type,
			periodicity: maintenance.periodicity,
			title: maintenance.title,
			description: maintenance.description,
			scheduledAt: maintenance.scheduledAt,
			canceledAt: maintenance.canceledAt,
			created_at: maintenance.createdAt,
			updated_at: maintenance.updatedAt,
		}
	}
}
