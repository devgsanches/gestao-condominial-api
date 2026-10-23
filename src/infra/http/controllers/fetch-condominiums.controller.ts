import {
	BadRequestException,
	Controller,
	Get,
	HttpCode,
	NotFoundException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { FetchCondominiumsByManagerUseCase } from '@/domain/management/application/use-cases/fetch-condominiums-by-manager'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CondominiumPresenter } from '../presenters/condominium-presenter'

@Controller({
	version: '1',
	path: 'condominium',
})
export class FetchCondominiumsController {
	constructor(
		private fetchCondominiumsByManager: FetchCondominiumsByManagerUseCase,
	) {}

	@Get()
	@HttpCode(200)
	async handle(@CurrentUser() user: UserPayload) {
		const response = await this.fetchCondominiumsByManager.execute({
			managerId: new UniqueEntityId(user.id),
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case NotFoundException:
					throw new NotFoundException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		return CondominiumPresenter.toHTTPList(response.result.condominiums)
	}
}
