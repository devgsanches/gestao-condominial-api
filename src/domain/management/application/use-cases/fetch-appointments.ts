import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Assembly } from '../../enterprise/entities/assembly'
import { Meeting } from '../../enterprise/entities/meeting'
import { AppointmentsRepository } from '../repositories/appointments-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ScheduleType } from './schedule-meeting'

export interface GroupedAppointments<T extends Meeting | Assembly> {
	canceled: T[]
	completed: T[]
	upcoming: T[]
}

interface FetchAppointmentsInput {
	type: ScheduleType
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type FetchAppointmentsOutput = Either<
	UnauthorizedException | NotFoundException,
	GroupedAppointments<Meeting | Assembly>
>

function groupAppointments<T extends Meeting | Assembly>(
	appointments: T[],
): GroupedAppointments<T> {
	const now = new Date()
	const canceled: T[] = []
	const completed: T[] = []
	const upcoming: T[] = []

	for (const appointment of appointments) {
		if (appointment.canceledAt) {
			canceled.push(appointment)
			continue
		}

		if (appointment.scheduledAt < now) {
			completed.push(appointment)
			continue
		}

		upcoming.push(appointment)
	}

	upcoming.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

	return { canceled, completed, upcoming }
}

@Injectable()
export class FetchAppointmentsUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private appointmentsRepository: AppointmentsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		type,
	}: FetchAppointmentsInput): Promise<FetchAppointmentsOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const isAssembly = type === ScheduleType.ASSEMBLY

		if (!isAssembly) {
			const meetings =
				await this.appointmentsRepository.findManyMeetingsByCondominiumId(
					condominiumId,
				)

			return right(groupAppointments(meetings))
		}

		const assemblies =
			await this.appointmentsRepository.findManyAssembliesByCondominiumId(
				condominiumId,
			)

		return right(groupAppointments(assemblies))
	}
}
