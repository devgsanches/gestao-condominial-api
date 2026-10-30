import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ScheduleMeetingUseCase } from '@/domain/management/application/use-cases/schedule-meeting'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ScheduleAppointmentRequestDTO } from '@/infra/http/dtos/schedule-appointment.dto'
import { AppointmentPresenter } from '../presenters/appointment-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/appointments',
})
export class ScheduleController {
	constructor(private scheduleMeeting: ScheduleMeetingUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Body() body: ScheduleAppointmentRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const { type, title, description, location, scheduledAt } = body

		const response = await this.scheduleMeeting.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			type,
			title,
			description,
			location,
			scheduledAt: new Date(scheduledAt),
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

		const appointment = response.result.meeting ?? response.result.assembly

		return AppointmentPresenter.toHTTP(appointment)
	}
}
