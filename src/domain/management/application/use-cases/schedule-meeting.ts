import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Assembly } from '../../enterprise/entities/assembly'
import { Meeting } from '../../enterprise/entities/meeting'
import { IAppointmentsRepository } from '../repositories/appointments-repository'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'

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
}

type ScheduleMeetingOutput = Either<
	UnauthorizedException | NotFoundException,
	| { meeting: Meeting; assembly?: never }
	| { assembly: Assembly; meeting?: never }
>

export class ScheduleMeetingUseCase {
	constructor(
		private condominiumRepository: ICondominiumsRepository,
		private appointmentsRepository: IAppointmentsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		type,
		title,
		description,
	}: ScheduleMeetingInput): Promise<ScheduleMeetingOutput> {
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
			const meeting = Meeting.create({
				condominiumId,
				title,
				description,
			})

			await this.appointmentsRepository.create(meeting)

			return right({ meeting })
		}

		const assembly = Assembly.create({
			condominiumId,
			title,
			description,
		})

		await this.appointmentsRepository.create(assembly)

		return right({ assembly })
	}
}
