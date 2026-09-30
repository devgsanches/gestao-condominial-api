import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { GetCondominiumUseCase } from './get-condominium'

// @TODO: Add coverage and test all possible errors

describe('GetCondominiumUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository

	let sut: GetCondominiumUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()

		sut = new GetCondominiumUseCase(inMemoryCondominiumsRepository) // system under test
	})

	it('should be possible for a manager to get a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominiumToBeFound = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominiumToBeFound)

		const condominiumToBeNotFound = makeCondominium({
			managerId: new UniqueEntityId(),
		})

		await inMemoryCondominiumsRepository.create(condominiumToBeNotFound)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominiumToBeFound.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.condominium).toMatchObject(condominiumToBeFound)
			expect(response.result.condominium).toMatchObject(
				expect.objectContaining({
					managerId: manager.id,
					name: 'Condomínio Teste',
				}),
			)
		}
	})

	it('should not be possible for a manager to get a condominium that is not theirs.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominiumToBeFound = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominiumToBeFound)

		const condominiumToBeNotFound = makeCondominium({
			managerId: new UniqueEntityId(),
		})

		await inMemoryCondominiumsRepository.create(condominiumToBeNotFound)

		const response = await sut.execute({
			managerId: new UniqueEntityId(),
			condominiumId: condominiumToBeFound.id,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})
})
