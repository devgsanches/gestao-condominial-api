import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Assembly } from '../../enterprise/entities/assembly'
import { Meeting } from '../../enterprise/entities/meeting'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface IAppointmentsRepository {
	create(appointment: Meeting | Assembly): Promise<void>
	findById(id: UniqueEntityId): Promise<Meeting | Assembly | null>
	findManyMeetingsByCondominiumId(condominiumId: UniqueEntityId): Promise<Meeting[]>
	findManyAssembliesByCondominiumId(condominiumId: UniqueEntityId): Promise<Assembly[]>
}
