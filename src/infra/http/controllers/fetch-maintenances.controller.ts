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
import { FetchMaintenancesUseCase } from '@/domain/management/application/use-cases/fetch-maintenances'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { FetchMaintenancesQueryDTO } from '@/infra/http/dtos/fetch-maintenances-query.dto'
import { MaintenancePresenter } from '../presenters/maintenance-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/maintenances',
})
export class FetchMaintenancesController {
	constructor(private fetchMaintenances: FetchMaintenancesUseCase) {}

	@Get()
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Query() query: FetchMaintenancesQueryDTO,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.fetchMaintenances.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			type: query.type,
			title: query.title,
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

		return MaintenancePresenter.toHTTPList(response.result.maintenances)
	}
}
