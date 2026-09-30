import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { FetchCondominiumsByManagerUseCase } from './fetch-condominiums-by-manager'

// @TODO: Add coverage and test all possible errors

describe('FetchCondominiumsByManagerUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository

	let sut: FetchCondominiumsByManagerUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()

		sut = new FetchCondominiumsByManagerUseCase(inMemoryCondominiumsRepository) // system under test
	})

	it('should be able to fetch condominiums by manager.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		for (let i = 1; i <= 3; i++) {
			const condominium = makeCondominium({
				managerId: manager.id,
			})

			await inMemoryCondominiumsRepository.create(condominium)
		}

		const response = await sut.execute({
			managerId: manager.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.condominiums).toHaveLength(3)
			expect(response.result.condominiums).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						managerId: manager.id,
						addressId: expect.any(UniqueEntityId),
						name: expect.any(String),
						createdAt: expect.any(Date),
					}),
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						managerId: manager.id,
						addressId: expect.any(UniqueEntityId),
						name: expect.any(String),
						createdAt: expect.any(Date),
					}),
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						managerId: manager.id,
						addressId: expect.any(UniqueEntityId),
						name: expect.any(String),
						createdAt: expect.any(Date),
					}),
				]),
			)
		}
	})
})
