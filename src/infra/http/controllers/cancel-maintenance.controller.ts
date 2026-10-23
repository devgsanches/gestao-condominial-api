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
import { CancelMaintenanceUseCase } from '@/domain/management/application/use-cases/cancel-maintenance'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { MaintenancePresenter } from '../presenters/maintenance-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/maintenances',
})
export class CancelMaintenanceController {
	constructor(private cancelMaintenance: CancelMaintenanceUseCase) {}

	@Patch(':maintenanceId/cancel')
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Param('maintenanceId') maintenanceId: string,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.cancelMaintenance.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			maintenanceId: new UniqueEntityId(maintenanceId),
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
