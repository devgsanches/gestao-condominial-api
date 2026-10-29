import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { ManagerNotFoundError } from './errors/manager-not-found'
import { GetManagerProfileUseCase } from './get-manager-profile'

// @TODO: Add coverage and test all possible errors

describe('GetManagerProfileUseCaseUseCase', () => {
	let inMemoryManagersRepository: InMemoryManagersRepository

	let sut: GetManagerProfileUseCase

	beforeEach(() => {
		inMemoryManagersRepository = new InMemoryManagersRepository()

		sut = new GetManagerProfileUseCase(inMemoryManagersRepository)
	})

	it('should be able to get a manager profile', async () => {
		const manager = makeManager(
			{
				name: 'Guilherme Sanches',
				email: 'guilherme@example.com',
				password: 'fake-hash',
			},
			new UniqueEntityId('mock-id'),
		)

		await inMemoryManagersRepository.create(manager)

		const response = await sut.execute({
			managerId: manager.id,
		})

		expect(response.isRight()).toBe(true)

		if (response.isRight()) {
			expect(response.result.id.toString()).toBe('mock-id')
			expect(response.result.name).toBe('Guilherme Sanches')
			expect(response.result.email).toBe('guilherme@example.com')
		}
	})

	it('should not be able to get a manager profile if the manager does not exist', async () => {
		const response = await sut.execute({
			managerId: new UniqueEntityId('mock-id'),
		})

		expect(response.isLeft()).toBe(true)

		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(ManagerNotFoundError)
		}
	})
})
