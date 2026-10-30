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
import { GetMaintenanceUseCase } from '@/domain/management/application/use-cases/get-maintenance'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { MaintenancePresenter } from '../presenters/maintenance-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/maintenances',
})
export class GetMaintenanceController {
	constructor(private getMaintenance: GetMaintenanceUseCase) {}

	@Get(':maintenanceId')
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Param('maintenanceId') maintenanceId: string,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.getMaintenance.execute({
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

		return MaintenancePresenter.toHTTPDetails(response.result.details)
	}
}
