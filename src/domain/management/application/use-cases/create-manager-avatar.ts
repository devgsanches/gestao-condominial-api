import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Manager } from '../../enterprise/entities/manager'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { ManagersRepository } from '../repositories/managers-repository'
import { AttachmentNotFoundError } from './errors/attachment-not-found-error'
import { AvatarAlreadyExistsError } from './errors/avatar-already-exists-error'
import { ManagerNotFoundError } from './errors/manager-not-found'

interface CreateManagerAvatarUseCaseRequest {
	managerId: UniqueEntityId
	attachmentId: UniqueEntityId
}

type CreateManagerAvatarUseCaseResponse = Either<
	ManagerNotFoundError | AttachmentNotFoundError | AvatarAlreadyExistsError,
	{
		manager: Manager
	}
>

@Injectable()
export class CreateManagerAvatarUseCase {
	constructor(
		private managersRepository: ManagersRepository,
		private attachmentsRepository: AttachmentsRepository,
	) {}

	async execute({
		managerId,
		attachmentId,
	}: CreateManagerAvatarUseCaseRequest): Promise<CreateManagerAvatarUseCaseResponse> {
		const manager = await this.managersRepository.findById(managerId)

		if (!manager) {
			return left(new ManagerNotFoundError())
		}

		const attachment = await this.attachmentsRepository.findById(attachmentId)

		if (!attachment) {
			return left(new AttachmentNotFoundError())
		}

		const avatarAlreadyExists = manager.avatarUrl === attachment.url

		if (avatarAlreadyExists) {
			return left(new AvatarAlreadyExistsError(attachment.url))
		}

		manager.avatarUrl = attachment?.url

		await this.managersRepository.save(manager)

		return right({ manager })
	}
}
