import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Attachment } from '@/domain/management/enterprise/entities/attachment'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { CreateManagerAvatarUseCase } from './create-manager-avatar'
import { AttachmentNotFoundError } from './errors/attachment-not-found-error'
import { AvatarAlreadyExistsError } from './errors/avatar-already-exists-error'
import { ManagerNotFoundError } from './errors/manager-not-found'

describe('CreateManagerAvatar UseCase', () => {
	let inMemoryManagersRepository: InMemoryManagersRepository
	let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository

	let sut: CreateManagerAvatarUseCase

	beforeEach(() => {
		inMemoryManagersRepository = new InMemoryManagersRepository()
		inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

		sut = new CreateManagerAvatarUseCase(
			inMemoryManagersRepository,
			inMemoryAttachmentsRepository,
		)
	})

	it('should be able to set a manager avatar', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		await inMemoryManagersRepository.create(manager)

		const attachment = Attachment.create({
			title: 'avatar.png',
			url: 'avatar.png',
		})

		await inMemoryAttachmentsRepository.create(attachment)

		const response = await sut.execute({
			managerId: manager.id,
			attachmentId: attachment.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)

		if (response.isRight()) {
			const { manager: updatedManager } = response.result

			expect(updatedManager.avatarUrl).toBe('avatar.png')
			expect(inMemoryManagersRepository.items[0]).toMatchObject(
				expect.objectContaining({
					id: manager.id,
					avatarUrl: 'avatar.png',
				}),
			)
		}
	})

	it('should not be able to set the same avatar twice', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
			avatarUrl: 'avatar.png',
		})

		await inMemoryManagersRepository.create(manager)

		const attachment = Attachment.create({
			title: 'avatar.png',
			url: 'avatar.png',
		})

		await inMemoryAttachmentsRepository.create(attachment)

		const response = await sut.execute({
			managerId: manager.id,
			attachmentId: attachment.id,
		})

		expect(response.isLeft()).toBe(true)

		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(AvatarAlreadyExistsError)
		}

		expect(inMemoryManagersRepository.items[0].avatarUrl).toBe('avatar.png')
	})

	it('should not be able to set an avatar for a manager that does not exist', async () => {
		const attachment = Attachment.create({
			title: 'avatar.png',
			url: 'avatar.png',
		})

		await inMemoryAttachmentsRepository.create(attachment)

		const response = await sut.execute({
			managerId: new UniqueEntityId('manager-1'),
			attachmentId: attachment.id,
		})

		expect(response.isLeft()).toBe(true)

		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(ManagerNotFoundError)
		}
	})

	it('should not be able to set an avatar with an attachment that does not exist', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		await inMemoryManagersRepository.create(manager)

		const response = await sut.execute({
			managerId: manager.id,
			attachmentId: new UniqueEntityId('attachment-1'),
		})

		expect(response.isLeft()).toBe(true)

		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(AttachmentNotFoundError)
		}
	})
})
