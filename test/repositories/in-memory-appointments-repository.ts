import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { IAppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import type { Assembly } from '@/domain/management/enterprise/entities/assembly'
import type { Meeting } from '@/domain/management/enterprise/entities/meeting'

export class InMemoryAppointmentsRepository implements IAppointmentsRepository {
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

	// async delete(id: UniqueEntityId) {
	// 	const appointments = this.items.filter((item) => item.id !== id)

	// 	this.items = appointments

	// 	return appointments
	// }
}
