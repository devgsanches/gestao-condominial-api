import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AdminAlreadyLinkedError } from '@/domain/management/application/use-cases/errors/admin-already-linked-error'
import { AdminNotFoundError } from '@/domain/management/application/use-cases/errors/admin-not-found-error'
import { LinkAdminToCondominiumUseCase } from '@/domain/management/application/use-cases/link-admin-to-condominium'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { LinkAdminToCondominiumRequestDTO } from '@/infra/http/dtos/link-admin-to-condominium.dto'

@Controller({
	version: '1',
	path: 'condominium',
})
export class LinkAdminToCondominiumController {
	constructor(private linkAdminToCondominium: LinkAdminToCondominiumUseCase) {}

	@Post(':condominiumId/admins')
	@HttpCode(204)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Body() body: LinkAdminToCondominiumRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const response = await this.linkAdminToCondominium.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			adminEmail: body.email,
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case NotFoundException:
				case AdminNotFoundError:
					throw new NotFoundException(error.message)
				case UnauthorizedException:
					throw new UnauthorizedException(error.message)
				case AdminAlreadyLinkedError:
					throw new ConflictException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}
	}
}
