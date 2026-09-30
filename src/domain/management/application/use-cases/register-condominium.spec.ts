import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { RegisterCondominiumUseCase } from './register-condominium'

// @TODO: Add coverage and test all possible errors

describe('RegisterCondominiumUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let sut: RegisterCondominiumUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()

		sut = new RegisterCondominiumUseCase(inMemoryCondominiumsRepository) // system under test
	})

	it('should be possible for a manager to register a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

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
