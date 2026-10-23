import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	Put,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { UpdateMaintenanceUseCase } from '@/domain/management/application/use-cases/update-maintenance'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { UpdateMaintenanceRequestDTO } from '@/infra/http/dtos/update-maintenance.dto'
import { MaintenancePresenter } from '../presenters/maintenance-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/maintenances',
})
export class UpdateMaintenanceController {
	constructor(private updateMaintenance: UpdateMaintenanceUseCase) {}

	@Put(':maintenanceId')
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Param('maintenanceId') maintenanceId: string,
		@Body() body: UpdateMaintenanceRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const { title, description } = body

		const response = await this.updateMaintenance.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			maintenanceId: new UniqueEntityId(maintenanceId),
			title,
			description,
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
