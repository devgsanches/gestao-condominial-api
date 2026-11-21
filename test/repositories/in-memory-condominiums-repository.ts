import {
	AppointmentType,
	MaintenancePeriodicity,
	MaintenanceType,
} from '@generated/prisma/enums'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { CondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import type { Condominium } from '@/domain/management/enterprise/entities/condominium'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'
import { CondominiumDashboard } from '@/domain/management/enterprise/entities/value-objects/condominium-dashboard'
import { CondominiumWithAddress } from '@/domain/management/enterprise/entities/value-objects/condominium-with-address'
import type { InMemoryAddressesRepository } from './in-memory-addresses-repository'
import type { InMemoryAdminsRepository } from './in-memory-admins-repository'
import type { InMemoryAppointmentsRepository } from './in-memory-appointments-repository'
import type { InMemoryMaintenancesRepository } from './in-memory-maintenances-repository'

export class InMemoryCondominiumsRepository implements CondominiumsRepository {
	public items: Condominium[] = []

	constructor(
		private addressesRepository?: InMemoryAddressesRepository,
		private maintenancesRepository?: InMemoryMaintenancesRepository,
		private appointmentsRepository?: InMemoryAppointmentsRepository,
		private adminsRepository?: InMemoryAdminsRepository,
	) {}

	async create(condominium: Condominium, adminIds: UniqueEntityId[] = []) {
		this.items.push(condominium)

		for (const adminId of adminIds) {
			await this.adminsRepository?.linkToCondominium(adminId, condominium.id)
		}
	}

	async findById(id: UniqueEntityId) {
		const condominium = this.items.find((item) => item.id.equals(id))

		if (!condominium) {
			return null
		}

		return condominium
	}

	async findByName(name: string) {
		const condominium = this.items.find((item) => item.name === name)

		if (!condominium) {
			return null
		}

		return condominium
	}

	async findByManagerId(managerId: UniqueEntityId) {
		const condominium = this.items.find((item) =>
			item.managerId.equals(managerId),
		)

		if (!condominium) {
			return null
		}

		return condominium
	}

	async findByAddressId(addressId: UniqueEntityId) {
		const condominium = this.items.find((item) =>
			item.addressId.equals(addressId),
		)

		if (!condominium) {
			return null
		}

		return condominium
	}

	async findManyByManagerId(managerId: UniqueEntityId) {
		const condominiums = this.items.filter((item) =>
			item.managerId.equals(managerId),
		)

		if (condominiums.length === 0) {
			return []
		}

		return condominiums
	}

	async findManyWithAddressByManagerId(
		managerId: UniqueEntityId,
	): Promise<CondominiumWithAddress[]> {
		const condominiums = this.items.filter((item) =>
			item.managerId.equals(managerId),
		)

		return this.withAddress(condominiums)
	}

	async findManyWithAddressByAdminId(
		adminId: UniqueEntityId,
	): Promise<CondominiumWithAddress[]> {
		const links = this.adminsRepository?.condominiumLinks ?? []

		const condominiums = this.items.filter((item) =>
			links.some(
				(link) =>
					link.adminId.equals(adminId) && link.condominiumId.equals(item.id),
			),
		)

		return this.withAddress(condominiums)
	}

	private withAddress(
		condominiums: Condominium[],
	): Promise<CondominiumWithAddress[]> {
		return Promise.all(
			condominiums.map(async (condominium) => {
				const address = this.addressesRepository?.items.find((item) =>
					item.id.equals(condominium.addressId),
				)

				if (!address) {
					throw new Error(
						`Address with ID "${condominium.addressId.toString()}" does not exist.`,
					)
				}

				return CondominiumWithAddress.create({
					condominium,
					address: {
						id: address.id,
						city: address.city,
					},
					periodicWithoutContractCount: await this.countPeriodicWithoutContract(
						condominium.id,
					),
				})
			}),
		)
	}

	async findDashboardbyCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<CondominiumDashboard | null> {
		const condominium = await this.findById(condominiumId)

		if (!condominium) {
			return null
		}

		const address = this.addressesRepository?.items.find((item) =>
			item.id.equals(condominium.addressId),
		)

		if (!address) {
			return null
		}

		const activeMaintenances = (
			await this.maintenancesRepository?.findManyByCondominiumId({
				condominiumId,
				filters: {},
			})
		)?.filter((maintenance) => !maintenance.canceledAt)

		const withoutContract =
			(
				await this.maintenancesRepository?.findManyWithContractByCondominiumId({
					condominiumId,
					filters: { withoutContract: true },
					pagination: { page: 1, perPage: Number.MAX_SAFE_INTEGER },
				})
			)?.maintenances ?? []

		const now = new Date()
		const upcomingAppointments = (this.appointmentsRepository?.items ?? [])
			.filter(
				(appointment) =>
					appointment.condominiumId.equals(condominiumId) &&
					!appointment.canceledAt &&
					appointment.scheduledAt >= now,
			)
			.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

		const nextAppointment = upcomingAppointments[0]

		return CondominiumDashboard.create({
			condominiumName: condominium.name,
			totalActiveMaintenancesCount: activeMaintenances?.length ?? 0,
			periodicMaintenancesWithoutContractCount: withoutContract.length,
			scheduledMeetingsCount: upcomingAppointments.length,
			nextAppointment: nextAppointment
				? {
						appointmentId: nextAppointment.id,
						type:
							nextAppointment instanceof Meeting
								? AppointmentType.MEETING
								: AppointmentType.ASSEMBLY,
						title: nextAppointment.title,
						description: nextAppointment.description,
						scheduledAt: nextAppointment.scheduledAt,
					}
				: null,
			periodicMaintenancesWithoutContract: withoutContract.map(
				(maintenance) => {
					const fullMaintenance = activeMaintenances?.find((item) =>
						item.id.equals(maintenance.maintenanceId),
					)

					return {
						maintenanceId: maintenance.maintenanceId,
						type: MaintenanceType.PERIODIC,
						title: maintenance.title,
						description: fullMaintenance?.description ?? '',
						periodicity: (
							maintenance.periodicity ?? 'month'
						).toUpperCase() as MaintenancePeriodicity,
					}
				},
			),
			condominiumAddress: {
				street: address.street,
				number: address.number,
				city: address.city,
				state: address.state,
			},
		})
	}

	async update(
		condominium: Pick<Condominium, 'name' | 'id' | 'unitsCount'>,
	): Promise<Condominium> {
		const condominiumIndex = this.items.findIndex((i) =>
			i.id.equals(condominium.id),
		)

		this.items[condominiumIndex].name = condominium.name
		this.items[condominiumIndex].unitsCount = condominium.unitsCount

		return this.items[condominiumIndex]
	}

	async delete(id: UniqueEntityId): Promise<void> {
		const validCondominiums = this.items.filter((item) => !item.id.equals(id))

		this.items = validCondominiums
	}

	private async countPeriodicWithoutContract(condominiumId: UniqueEntityId) {
		if (!this.maintenancesRepository) {
			return 0
		}

		const { total } =
			await this.maintenancesRepository.findManyWithContractByCondominiumId({
				condominiumId,
				filters: { withoutContract: true },
				pagination: { page: 1, perPage: 1 },
			})

		return total
	}
}
