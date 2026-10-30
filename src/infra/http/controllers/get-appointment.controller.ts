import {
	BadRequestException,
	Controller,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { GetAppointmentUseCase } from '@/domain/management/application/use-cases/get-appointment'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { AppointmentPresenter } from '../presenters/appointment-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/appointments',
})
export class GetAppointmentController {
	constructor(private getAppointment: GetAppointmentUseCase) {}

	@Get(':appointmentId')
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Param('appointmentId') appointmentId: string,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.getAppointment.execute({
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
