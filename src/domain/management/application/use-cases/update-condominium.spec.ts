import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { UpdateCondominiumUseCase } from './update-condominium'

// @TODO: Add coverage and test all possible errors

describe('UpdateCondominiumUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository

	let sut: UpdateCondominiumUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()

		sut = new UpdateCondominiumUseCase(inMemoryCondominiumsRepository) // system under test
	})

	it('should be possible for a manager to update a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominiumToBeUpdated = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominiumToBeUpdated)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominiumToBeUpdated.id,
			name: 'Condomínio Teste Atualizado',
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.condominium).toMatchObject(condominiumToBeUpdated)

			expect(response.result.condominium).toMatchObject(
				expect.objectContaining({
					managerId: manager.id,
					id: condominiumToBeUpdated.id,
					name: 'Condomínio Teste Atualizado',
				}),
			)
		}
	})

	it('should not be possible for a manager to update a condominium that is not theirs.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const randomCondominium = makeCondominium({
			managerId: new UniqueEntityId(),
		})

		await inMemoryCondominiumsRepository.create(randomCondominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: randomCondominium.id,
			name: 'Condomínio Teste Atualizado',
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})
})
