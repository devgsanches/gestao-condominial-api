import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class MaintenancePresenter {
	static toHTTP(maintenance: Maintenance) {
		return {
			maintenance: MaintenancePresenter.toHTTPItem(maintenance),
		}
	}

	static toHTTPList(maintenances: Maintenance[]) {
		return {
			maintenances: maintenances.map(MaintenancePresenter.toHTTPItem),
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
