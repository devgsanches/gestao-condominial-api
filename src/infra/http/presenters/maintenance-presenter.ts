import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'
import { MaintenanceWithContract } from '@/domain/management/enterprise/entities/value-objects/maintenance-with-contract'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class MaintenancePresenter {
	static toHTTP(maintenance: Maintenance) {
		return {
			maintenance: MaintenancePresenter.toHTTPItem(maintenance),
		}
	}

	static toHTTPList(maintenances: MaintenanceWithContract[]) {
		return {
			maintenances: maintenances.map((maintenance) => ({
				id: maintenance.maintenanceId.toString(),
				condominiumId: maintenance.condominiumId.toString(),
				type: maintenance.type,
				periodicity: maintenance.periodicity,
				contractId: maintenance.contractId
					? maintenance.contractId.toString()
					: null,
				title: maintenance.title,
				canceledAt: maintenance.canceledAt,
				created_at: maintenance.createdAt,
				updated_at: maintenance.updatedAt,
			})),
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
			canceledAt: maintenance.canceledAt,
			created_at: maintenance.createdAt,
			updated_at: maintenance.updatedAt,
		}
	}
}
