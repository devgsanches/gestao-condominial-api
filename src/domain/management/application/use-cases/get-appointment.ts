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

interface GetAppointmentInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	appointmentId: UniqueEntityId
}

type GetAppointmentOutput = Either<
	NotFoundException | UnauthorizedException,
	{ appointment: Meeting | Assembly }
>

@Injectable()
export class GetAppointmentUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private appointmentsRepository: AppointmentsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		appointmentId,
	}: GetAppointmentInput): Promise<GetAppointmentOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException('Condominium not found.'))
		}

		if (!condominium.managerId.equals(managerId)) {
			return left(new UnauthorizedException())
		}

		const appointment =
			await this.appointmentsRepository.findById(appointmentId)

		if (!appointment?.condominiumId.equals(condominiumId)) {
			return left(new NotFoundException('Appointment not found.'))
		}

		return right({ appointment })
	}
}
