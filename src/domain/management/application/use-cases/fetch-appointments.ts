import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppointmentWithType } from '../../enterprise/entities/value-objects/appointment-with-type'
import { AdminsRepository } from '../repositories/admins-repository'
import { AppointmentsRepository } from '../repositories/appointments-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ScheduleType } from './schedule-meeting'

export interface GroupedAppointments<T> {
	canceled: T[]
	completed: T[]
	upcoming: T[]
}

interface FetchAppointmentsInput {
	type?: ScheduleType
	title?: string
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type FetchAppointmentsOutput = Either<
	UnauthorizedException | NotFoundException,
	GroupedAppointments<AppointmentWithType>
>

function groupAppointments(
	appointments: AppointmentWithType[],
): GroupedAppointments<AppointmentWithType> {
	const now = new Date()
	const canceled: AppointmentWithType[] = []
	const completed: AppointmentWithType[] = []
	const upcoming: AppointmentWithType[] = []

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
		private adminsRepository: AdminsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		type,
		title,
	}: FetchAppointmentsInput): Promise<FetchAppointmentsOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		const isValidAdmin =
			!isCondominiumManager &&
			(await this.adminsRepository.isAdminOfCondominium(
				managerId,
				condominium.id,
			))

		if (!isCondominiumManager && !isValidAdmin) {
			return left(new UnauthorizedException())
		}

		const appointments =
			await this.appointmentsRepository.findManyByCondominiumId({
				condominiumId,
				filters: {
					title,
					type,
				},
			})

		return right(groupAppointments(appointments))
	}
}
