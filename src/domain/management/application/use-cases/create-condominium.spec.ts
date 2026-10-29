import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { CreateCondominiumUseCase } from './create-condominium'

describe('CreateCondominiumUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryManagersRepository: InMemoryManagersRepository
	let sut: CreateCondominiumUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryManagersRepository = new InMemoryManagersRepository()

		sut = new CreateCondominiumUseCase(
			inMemoryCondominiumsRepository,
			inMemoryManagersRepository,
		)
	})

	it('should be possible for a manager to create a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		await inMemoryManagersRepository.create(manager)

		const response = await sut.execute({
			managerId: manager.id,
			addressId: new UniqueEntityId(),
			name: 'Condomínio do Guilherme',
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result).toMatchObject({
				condominium: expect.objectContaining({
					id: expect.any(UniqueEntityId),
					managerId: expect.any(UniqueEntityId),
					addressId: expect.any(UniqueEntityId),
					name: 'Condomínio do Guilherme',
				}),
			})
		}
	})
})
