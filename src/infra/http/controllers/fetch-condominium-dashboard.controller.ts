import {
	BadRequestException,
	Controller,
	Get,
	HttpCode,
	NotFoundException,
	Param,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { FetchCondominiumDashboardUseCase } from '@/domain/management/application/use-cases/fetch-condominium-dashboard'
import { CondominiumInformationNotFoundError } from '@/domain/management/application/use-cases/errors/condominium-information-not-found-error'
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
	async handle(@Param('condominiumId') condominiumId: string) {
		const response = await this.fetchCondominiumDashboard.execute({
			condominiumId: new UniqueEntityId(condominiumId),
		})

		if (response.isLeft()) {
			const error = response.reason

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
