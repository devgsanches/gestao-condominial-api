import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	Patch,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { UpdateCondominiumUseCase } from '@/domain/management/application/use-cases/update-condominium'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { UpdateCondominiumRequestDTO } from '@/infra/http/dtos/update-condominium.dto'
import { CondominiumPresenter } from '../presenters/condominium-presenter'

@Controller({
	version: '1',
	path: 'condominium',
})
export class UpdateCondominiumController {
	constructor(private updateCondominium: UpdateCondominiumUseCase) {}

	@Patch(':condominiumId')
	@HttpCode(200)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Body() body: UpdateCondominiumRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const { name, unitsCount } = body

		const response = await this.updateCondominium.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			name,
			unitsCount,
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

		return CondominiumPresenter.toHTTP(response.result.condominium)
	}
}
