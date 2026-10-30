import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { compareAsc } from 'date-fns'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Assembly } from '../../enterprise/entities/assembly'
import { Meeting } from '../../enterprise/entities/meeting'
import { AppointmentsRepository } from '../repositories/appointments-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'

export enum ScheduleType {
	MEETING = 'meeting',
	ASSEMBLY = 'assembly',
}

interface ScheduleMeetingInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	type: ScheduleType
	title: string
	description: string
	location?: string | null
	scheduledAt: Date
}

type ScheduleMeetingOutput = Either<
	UnauthorizedException | NotFoundException | BadRequestException,
	| { meeting: Meeting; assembly?: never }
	| { assembly: Assembly; meeting?: never }
>

@Injectable()
export class ScheduleMeetingUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private appointmentsRepository: AppointmentsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		type,
		title,
		description,
		location,
		scheduledAt,
	}: ScheduleMeetingInput): Promise<ScheduleMeetingOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const scheduleDate = new Date(scheduledAt)
		const today = new Date()

		if (compareAsc(scheduleDate, today) <= 0) {
			return left(
				new BadRequestException(
					'Schedule date is in the past. Please, select a date in the future.',
				),
			)
		}

		const isAssembly = type === ScheduleType.ASSEMBLY

		if (!isAssembly) {
			const meeting = Meeting.create({
				condominiumId,
				title,
				description,
				location,
				scheduledAt,
			})

			await this.appointmentsRepository.create(meeting)

			return right({ meeting })
		}

		const assembly = Assembly.create({
			condominiumId,
			title,
			description,
			location,
			scheduledAt,
		})

		await this.appointmentsRepository.create(assembly)

		return right({ assembly })
	}
}
