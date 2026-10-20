import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppointmentsRepository } from '../repositories/appointments-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'

interface CancelAppointmentsInput {
	managerId: UniqueEntityId
	appointmentId: UniqueEntityId
}

type CancelAppointmentsOutput = Either<
	UnauthorizedException | NotFoundException,
	null
>

export class CancelAppointmentsUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private appointmentsRepository: AppointmentsRepository,
	) {}

	async execute({
		managerId,
		appointmentId,
	}: CancelAppointmentsInput): Promise<CancelAppointmentsOutput> {
		const condominium =
			await this.condominiumRepository.findByManagerId(managerId)

		const isCondominiumManager = condominium?.managerId.equals(managerId)

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const appointment =
			await this.appointmentsRepository.findById(appointmentId)

		if (!appointment) {
			return left(new NotFoundException())
		}

		appointment.canceledAt = new Date()

		await this.appointmentsRepository.update(appointment)

		return right(null)
	}
}
