import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAddressesRepository } from '@/test/repositories/in-memory-addresses-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { DeleteCondominiumUseCase } from './delete-condominium'

// @TODO: Add coverage and test all possible errors

describe('DeleteCondominiumUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAddressesRepository: InMemoryAddressesRepository

	let sut: DeleteCondominiumUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()

		inMemoryAddressesRepository = new InMemoryAddressesRepository()

		sut = new DeleteCondominiumUseCase(
			inMemoryCondominiumsRepository,
			inMemoryAddressesRepository,
		) // system under test
	})

	it('should be possible for a manager to delete a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominiumToBeDeleted = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominiumToBeDeleted)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominiumToBeDeleted.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result).toBeNull()
		}
	})

	it('should not be possible for a manager to delete a condominium that is not theirs.', async () => {
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
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})
})
