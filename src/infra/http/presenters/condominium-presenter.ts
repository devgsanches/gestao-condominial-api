import { GetCondominiumDashboard } from '@/domain/management/application/use-cases/get-condominium'
import { Condominium } from '@/domain/management/enterprise/entities/condominium'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'
import { CondominiumWithAddress } from '@/domain/management/enterprise/entities/value-objects/condominium-with-address'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class CondominiumPresenter {
	static toHTTP(condominium: Condominium) {
		return {
			condominium: CondominiumPresenter.toHTTPItem(condominium),
		}
	}

	static toHTTPList(condominiums: CondominiumWithAddress[]) {
		return {
			condominiums: condominiums.map((condominiumWithAddress) => {
				const { addressId: _, ...condominium } =
					CondominiumPresenter.toHTTPItem(condominiumWithAddress.condominium)

				return {
					...condominium,
					address: {
						id: condominiumWithAddress.address.id.toString(),
						city: condominiumWithAddress.address.city,
					},
				}
			}),
		}
	}

	private static toHTTPItem(condominium: Condominium) {
		return {
			id: condominium.id.toString(),
			name: condominium.name,
			slug: condominium.slug.value,
			managerId: condominium.managerId.toString(),
			addressId: condominium.addressId.toString(),
			created_at: condominium.createdAt,
			updated_at: condominium.updatedAt,
		}
	}

	static toDashboardHTTP(dashboard: GetCondominiumDashboard) {
		return {
			condominium: {
				id: dashboard.condominium.id.toString(),
				name: dashboard.condominium.name,
			},
			address: {
				street: dashboard.address.street,
				number: dashboard.address.number,
				neighborhood: dashboard.address.neighborhood,
				city: dashboard.address.city,
				state: dashboard.address.state,
			},
			activeMaintenancesCount: dashboard.activeMaintenancesCount,
			periodicWithoutContractCount: dashboard.periodicWithoutContractCount,
			scheduledAppointmentsCount: dashboard.scheduledAppointmentsCount,
			nextAppointment: dashboard.nextAppointment
				? {
						id: dashboard.nextAppointment.id.toString(),
						type:
							dashboard.nextAppointment instanceof Meeting
								? 'meeting'
								: 'assembly',
						title: dashboard.nextAppointment.title,
						scheduledAt: dashboard.nextAppointment.scheduledAt,
					}
				: null,
			periodicWithoutContract: dashboard.periodicWithoutContract.map(
				(maintenance) => ({
					id: maintenance.id.toString(),
					title: maintenance.title,
					periodicity: maintenance.periodicity,
				}),
			),
		}
	}
}
