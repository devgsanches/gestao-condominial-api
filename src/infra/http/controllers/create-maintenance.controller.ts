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
import { CreateMaintenanceUseCase } from '@/domain/management/application/use-cases/create-maintenance'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CreateMaintenanceRequestDTO } from '@/infra/http/dtos/create-maintenance.dto'
import { MaintenancePresenter } from '../presenters/maintenance-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/maintenances',
})
export class CreateMaintenanceController {
	constructor(private createMaintenance: CreateMaintenanceUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Body() body: CreateMaintenanceRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const { title, description, type, periodicity, scheduledAt } = body

		const response = await this.createMaintenance.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			title,
			description,
			type,
			periodicity,
			scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
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

		return MaintenancePresenter.toHTTP(response.result.maintenance)
	}
}
