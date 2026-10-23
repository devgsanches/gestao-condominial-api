import {
	BadRequestException,
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	Patch,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CancelAppointmentsUseCase } from '@/domain/management/application/use-cases/cancel-appointment'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { AppointmentPresenter } from '../presenters/appointment-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/appointments',
})
export class CancelAppointmentController {
	constructor(private cancelAppointment: CancelAppointmentsUseCase) {}

	@Patch(':appointmentId/cancel')
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Param('appointmentId') appointmentId: string,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.cancelAppointment.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			appointmentId: new UniqueEntityId(appointmentId),
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case NotFoundException:
					throw new NotFoundException(error.message)
				case UnauthorizedException:
					throw new UnauthorizedException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		return AppointmentPresenter.toHTTP(response.result.appointment)
	}
}
