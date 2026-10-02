import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { Meeting } from '../../enterprise/entities/meeting'
import { Assembly } from '../../enterprise/entities/assembly'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export interface IAppointmentsRepository {
	create(appointment: Meeting | Assembly): Promise<void>
	findById(id: UniqueEntityId): Promise<Meeting | Assembly | null>
}
