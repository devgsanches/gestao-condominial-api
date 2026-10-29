import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '@/domain/management/enterprise/entities/address'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAddressesRepository } from '@/test/repositories/in-memory-addresses-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { FetchCondominiumsByManagerUseCase } from './fetch-condominiums-by-manager'

// @TODO: Add coverage and test all possible errors

describe('FetchCondominiumsByManagerUseCase', () => {
	let inMemoryAddressesRepository: InMemoryAddressesRepository
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository

	let sut: FetchCondominiumsByManagerUseCase

	beforeEach(() => {
		inMemoryAddressesRepository = new InMemoryAddressesRepository()
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository(
			inMemoryAddressesRepository,
		)

		sut = new FetchCondominiumsByManagerUseCase(inMemoryCondominiumsRepository)
	})

	it('should be able to fetch condominiums by manager.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		for (let i = 1; i <= 3; i++) {
			const addressId = new UniqueEntityId(`address-${i}`)

			await inMemoryAddressesRepository.create(
				Address.create(
					{
						zipCode: '01310-100',
						street: 'Avenida Paulista',
						number: 1000,
						neighborhood: 'Bela Vista',
						city: `Cidade ${i}`,
						state: 'SP',
						country: 'Brasil',
					},
					addressId,
				),
			)

			const condominium = makeCondominium({
				managerId: manager.id,
				addressId,
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
			expect(
				response.result.condominiums.map((item) => item.address.city),
			).toEqual(expect.arrayContaining(['Cidade 1', 'Cidade 2', 'Cidade 3']))
			expect(
				response.result.condominiums.map((item) => item.address.id.toString()),
			).toEqual(expect.arrayContaining(['address-1', 'address-2', 'address-3']))
			expect(
				response.result.condominiums.every((item) =>
					item.condominium.managerId.equals(manager.id),
				),
			).toBe(true)
		}
	})
})
