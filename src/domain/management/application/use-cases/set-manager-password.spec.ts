import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { FakeHasher } from '@/test/cryptography/fake-hasher'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { ManagerNotFoundError } from './errors/manager-not-found'
import { SetManagerPasswordUseCase } from './set-manager-password'

describe('SetManagerPasswordUseCase', () => {
	let inMemoryManagersRepository: InMemoryManagersRepository

	let sut: SetManagerPasswordUseCase

	beforeEach(() => {
		inMemoryManagersRepository = new InMemoryManagersRepository()

		sut = new SetManagerPasswordUseCase(
			inMemoryManagersRepository,
			new FakeHasher(),
		) // system under test
	})

	it('should hash and save the new password', async () => {
		const manager = makeManager({ password: 'old-password' })
		await inMemoryManagersRepository.create(manager)

		const response = await sut.execute({
			managerId: manager.id,
			password: 'new-password',
		})

		expect(response.isRight()).toBe(true)
		expect(inMemoryManagersRepository.items[0].password).toBe(
			'new-password-hashed',
		)
		expect(inMemoryManagersRepository.items[0].updatedAt).toEqual(
			expect.any(Date),
		)
	})

	it('should return not found for an unknown manager', async () => {
		const response = await sut.execute({
			managerId: new UniqueEntityId('unknown'),
			password: 'new-password',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(ManagerNotFoundError)
		}
	})
})
