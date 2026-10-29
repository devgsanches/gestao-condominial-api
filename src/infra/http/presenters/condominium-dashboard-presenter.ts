import { CondominiumDashboard } from '@/domain/management/enterprise/entities/value-objects/condominium-dashboard'

// biome-ignore lint/complexity/noStaticOnlyClass: presenter utilitário com métodos estáticos
export class CondominiumDashboardPresenter {
	static toHTTP(dashboard: CondominiumDashboard) {
		return {
			condominiumName: dashboard.condominiumName,
			totalActiveMaintenancesCount: dashboard.totalActiveMaintenancesCount,
			periodicMaintenancesWithoutContractCount:
				dashboard.periodicMaintenancesWithoutContractCount,
			scheduledMeetingsCount: dashboard.scheduledMeetingsCount,
			nextAppointment: dashboard.nextAppointment
				? {
						appointmentId: dashboard.nextAppointment.appointmentId.toString(),
						type: dashboard.nextAppointment.type,
						title: dashboard.nextAppointment.title,
						description: dashboard.nextAppointment.description,
						scheduledAt: dashboard.nextAppointment.scheduledAt,
					}
				: null,
			periodicMaintenancesWithoutContract:
				dashboard.periodicMaintenancesWithoutContract.map((maintenance) => ({
					maintenanceId: maintenance.maintenanceId.toString(),
					type: maintenance.type,
					title: maintenance.title,
					description: maintenance.description,
					periodicity: maintenance.periodicity,
				})),
			condominiumAddress: {
				street: dashboard.condominiumAddress.street,
				number: dashboard.condominiumAddress.number,
				city: dashboard.condominiumAddress.city,
				state: dashboard.condominiumAddress.state,
			},
		}
	}
}
