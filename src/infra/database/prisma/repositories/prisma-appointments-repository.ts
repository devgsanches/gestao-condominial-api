import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IAppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import { Assembly } from '@/domain/management/enterprise/entities/assembly'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'

@Injectable()
export class PrismaAppointmentsRepository implements IAppointmentsRepository {
	create(appointment: Meeting | Assembly): Promise<void> {
		throw new Error('Method not implemented.')
	}
	findById(id: UniqueEntityId): Promise<Meeting | Assembly | null> {
		throw new Error('Method not implemented.')
	}
	findManyMeetingsByCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<Meeting[]> {
		throw new Error('Method not implemented.')
	}
	findManyAssembliesByCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<Assembly[]> {
		throw new Error('Method not implemented.')
	}
	update(appointment: Meeting | Assembly): Promise<Meeting | Assembly | null> {
		throw new Error('Method not implemented.')
	}
}
