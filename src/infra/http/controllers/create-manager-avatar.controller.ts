import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	NotFoundException,
	Post,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CreateManagerAvatarUseCase } from '@/domain/management/application/use-cases/create-manager-avatar'
import { AttachmentNotFoundError } from '@/domain/management/application/use-cases/errors/attachment-not-found-error'
import { ManagerNotFoundError } from '@/domain/management/application/use-cases/errors/manager-not-found'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CreateManagerAvatarRequestDTO } from '../dtos/create-manager-avatar.dto'
import { ManagerPresenter } from '../presenters/manager-presenter'
import { AvatarAlreadyExistsError } from '@/domain/management/application/use-cases/errors/avatar-already-exists-error'

@Controller({
	version: '1',
	path: 'accounts/manager/profile',
})
export class CreateManagerAvatarController {
	constructor(private createManagerAvatar: CreateManagerAvatarUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@Body() body: CreateManagerAvatarRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const { attachmentId } = body

		const response = await this.createManagerAvatar.execute({
			managerId: new UniqueEntityId(user.id),
			attachmentId: new UniqueEntityId(attachmentId),
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case ManagerNotFoundError:
					throw new NotFoundException(error.message)
				case AttachmentNotFoundError:
					throw new NotFoundException(error.message)
				case AvatarAlreadyExistsError:
					throw new BadRequestException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		const { manager } = response.result

		return ManagerPresenter.toHTTP(manager)
	}
}
