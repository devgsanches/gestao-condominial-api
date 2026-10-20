import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { AppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import { Assembly } from '@/domain/management/enterprise/entities/assembly'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'

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
