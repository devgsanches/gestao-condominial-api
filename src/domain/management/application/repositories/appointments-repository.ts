import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Assembly } from '../../enterprise/entities/assembly'
import { Meeting } from '../../enterprise/entities/meeting'
import { AppointmentWithType } from '../../enterprise/entities/value-objects/appointment-with-type'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class AppointmentsRepository {
	abstract create(appointment: Meeting | Assembly): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Meeting | Assembly | null>
	abstract findManyMeetingsByCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<Meeting[]>
	abstract findManyAssembliesByCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<Assembly[]>
	abstract findManyByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: 'meeting' | 'assembly' }
	}): Promise<AppointmentWithType[]>
	abstract update(
		appointment: Meeting | Assembly,
	): Promise<Meeting | Assembly | null>
}
