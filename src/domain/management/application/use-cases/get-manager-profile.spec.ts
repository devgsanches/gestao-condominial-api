import { NotFoundException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { GetManagerProfileUseCase } from './get-manager-profile'

// @TODO: Add coverage and test all possible errors

describe('GetManagerProfileUseCaseUseCase', () => {
	let inMemoryManagersRepository: InMemoryManagersRepository
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository

	let sut: GetManagerProfileUseCase

	beforeEach(() => {
		inMemoryManagersRepository = new InMemoryManagersRepository()
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()

		sut = new GetManagerProfileUseCase(
			inMemoryManagersRepository,
			inMemoryCondominiumsRepository,
		) // system under test
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

		// create 3 condominiums
		for (let i = 1; i <= 3; i++) {
			const condominium = makeCondominium({
				managerId: manager.id,
				name: `Condomínio ${i}`,
				addressId: new UniqueEntityId(`address-${i}`),
			})

			await inMemoryCondominiumsRepository.create(condominium)
		}

		const response = await sut.execute({
			managerId: manager.id,
		})

		if (response.isRight()) {
			const { manager } = response.result

			expect(manager).toMatchObject(
				expect.objectContaining({
					id: new UniqueEntityId('mock-id'),
					name: 'Guilherme Sanches',
					email: 'guilherme@example.com',
				}),
			)
			expect(manager.condominiums).toHaveLength(3)
		}
	})

	it('should not be able to get a manager profile if the manager does not exist', async () => {
		const response = await sut.execute({
			managerId: new UniqueEntityId('mock-id'),
		})

		if (response.isLeft()) {
			const { reason } = response

			expect(reason).toBeInstanceOf(NotFoundException)
		}
	})
})
