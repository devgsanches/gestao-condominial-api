import {
	BadRequestException,
	Controller,
	Get,
	HttpCode,
	HttpException,
	NotFoundException,
	Param,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CondominiumInformationNotFoundError } from '@/domain/management/application/use-cases/errors/condominium-information-not-found-error'
import { FetchCondominiumDashboardUseCase } from '@/domain/management/application/use-cases/fetch-condominium-dashboard'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CondominiumDashboardPresenter } from '../presenters/condominium-dashboard-presenter'

@Controller({
	version: '1',
	path: 'condominium',
})
export class FetchCondominiumDashboardController {
	constructor(
		private fetchCondominiumDashboard: FetchCondominiumDashboardUseCase,
	) {}

	@Get(':condominiumId/dashboard')
	@HttpCode(200)
	async handle(
		@CurrentUser() user: UserPayload,
		@Param('condominiumId') condominiumId: string,
	) {
		const response = await this.fetchCondominiumDashboard.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
		})

		if (response.isLeft()) {
			const error = response.reason

			if (error instanceof HttpException) {
				throw error
			}

			switch (error.constructor) {
				case CondominiumInformationNotFoundError:
					throw new NotFoundException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		return CondominiumDashboardPresenter.toHTTP(response.result.dashboard)
	}
}
