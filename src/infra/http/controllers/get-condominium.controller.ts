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
import { GetCondominiumUseCase } from '@/domain/management/application/use-cases/get-condominium'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CondominiumPresenter } from '../presenters/condominium-presenter'

@Controller({
	version: '1',
	path: 'condominium',
})
export class GetCondominiumController {
	constructor(private getCondominium: GetCondominiumUseCase) {}

	@Get(':condominiumId')
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.getCondominium.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
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

		return CondominiumPresenter.toDashboardHTTP(response.result)
	}
}
