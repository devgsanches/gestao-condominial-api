import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Assembly } from '../../enterprise/entities/assembly'
import { Meeting } from '../../enterprise/entities/meeting'
import { AppointmentsRepository } from '../repositories/appointments-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ScheduleType } from './schedule-meeting'

interface FetchAppointmentsInput {
	type: ScheduleType
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type FetchAppointmentsOutput = Either<
	UnauthorizedException | NotFoundException,
	| { meetings: Meeting[]; assemblies?: never }
	| { assemblies: Assembly[]; meetings?: never }
>

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

			return right({ meetings })
		}

		const assemblies =
			await this.appointmentsRepository.findManyAssembliesByCondominiumId(
				condominiumId,
			)

		return right({ assemblies })
	}
}
