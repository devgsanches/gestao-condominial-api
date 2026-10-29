import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { AppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import { Assembly } from '@/domain/management/enterprise/entities/assembly'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'
import { AppointmentWithType } from '@/domain/management/enterprise/entities/value-objects/appointment-with-type'

export class InMemoryAppointmentsRepository implements AppointmentsRepository {
	public items: (Meeting | Assembly)[] = []

	async create(appointment: Meeting | Assembly) {
		this.items.push(appointment)
	}

	async findById(id: UniqueEntityId) {
		const appointment = this.items.find((item) => item.id === id)

		if (!appointment) {
			return null
		}

		return appointment
	}

	async findManyMeetingsByCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<Meeting[]> {
		const meetings = this.items.filter(
			(item) =>
				item instanceof Meeting && item.condominiumId.equals(condominiumId),
		)

		return meetings
	}

	async findManyAssembliesByCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<Assembly[]> {
		const assemblies = this.items.filter(
			(item) =>
				item instanceof Assembly && item.condominiumId.equals(condominiumId),
		)

		return assemblies
	}

	async findManyByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: 'meeting' | 'assembly' }
	}) {
		return this.items
			.filter((item) => item.condominiumId.equals(condominiumId))
			.filter((item) =>
				filters.title ? item.title.includes(filters.title) : true,
			)
			.filter((item) => {
				if (!filters.type) {
					return true
				}

				if (filters.type === 'meeting') {
					return item instanceof Meeting
				}

				return item instanceof Assembly
			})
			.map((appointment) =>
				AppointmentWithType.create({
					appointmentId: appointment.id,
					condominiumId: appointment.condominiumId,
					type: appointment instanceof Meeting ? 'meeting' : 'assembly',
					title: appointment.title,
					description: appointment.description,
					scheduledAt: appointment.scheduledAt,
					canceledAt: appointment.canceledAt,
					createdAt: appointment.createdAt,
					updatedAt: appointment.updatedAt,
				}),
			)
	}

	async update(appointment: Meeting | Assembly) {
		const appointmentIndex = this.items.findIndex((item) =>
			item.id.equals(appointment.id),
		)

		if (appointmentIndex === -1) {
			return null
		}

		this.items[appointmentIndex] = appointment

		return appointment
	}

	// async delete(id: UniqueEntityId) {
	// 	const appointments = this.items.filter((item) => item.id !== id)

	// 	this.items = appointments

	// 	return appointments
	// }
}
