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

interface CancelAppointmentsInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	appointmentId: UniqueEntityId
}

type CancelAppointmentsOutput = Either<
	UnauthorizedException | NotFoundException,
	{
		appointment: Meeting | Assembly
	}
>

@Injectable()
export class CancelAppointmentsUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private appointmentsRepository: AppointmentsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		appointmentId,
	}: CancelAppointmentsInput): Promise<CancelAppointmentsOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const appointment =
			await this.appointmentsRepository.findById(appointmentId)

		if (!appointment?.condominiumId.equals(condominiumId)) {
			return left(new NotFoundException())
		}

		appointment.canceledAt = new Date()

		await this.appointmentsRepository.update(appointment)

		return right({ appointment })
	}
}
