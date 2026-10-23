import {
	BadRequestException,
	Controller,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Query,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { FetchAppointmentsUseCase } from '@/domain/management/application/use-cases/fetch-appointments'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { FetchAppointmentsQueryDTO } from '@/infra/http/dtos/fetch-appointments-query.dto'
import { AppointmentPresenter } from '../presenters/appointment-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/appointments',
})
export class FetchAppointmentsController {
	constructor(private fetchAppointments: FetchAppointmentsUseCase) {}

	@Get()
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Query() query: FetchAppointmentsQueryDTO,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.fetchAppointments.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			type: query.type,
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

		return AppointmentPresenter.toHTTPGrouped(response.result)
	}
}
