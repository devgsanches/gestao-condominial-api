import {
	BadRequestException,
	Controller,
	Delete,
	HttpCode,
	NotFoundException,
	Param,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DeleteCondominiumUseCase } from '@/domain/management/application/use-cases/delete-condominium'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

@Controller({
	version: '1',
	path: 'condominium',
})
export class DeleteCondominiumController {
	constructor(private deleteCondominium: DeleteCondominiumUseCase) {}

	@Delete(':condominiumId')
	@HttpCode(204)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.deleteCondominium.execute({
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
	}
}
