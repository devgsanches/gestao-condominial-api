import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '@/domain/management/enterprise/entities/address'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAddressesRepository } from '@/test/repositories/in-memory-addresses-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { ManagerNotFoundError } from './errors/manager-not-found'
import { GetManagerProfileUseCase } from './get-manager-profile'

// @TODO: Add coverage and test all possible errors

describe('GetManagerProfileUseCaseUseCase', () => {
	let inMemoryManagersRepository: InMemoryManagersRepository
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAddressesRepository: InMemoryAddressesRepository

	let sut: GetManagerProfileUseCase

	beforeEach(() => {
		inMemoryManagersRepository = new InMemoryManagersRepository()
		inMemoryAddressesRepository = new InMemoryAddressesRepository()
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository(
			inMemoryAddressesRepository,
		)

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

		await inMemoryManagersRepository.create(manager)

		// create 3 condominiums
		for (let i = 1; i <= 3; i++) {
			const addressId = new UniqueEntityId(`address-${i}`)

			const address = Address.create(
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
			)

			await inMemoryAddressesRepository.create(address)

			const condominium = makeCondominium({
				managerId: manager.id,
				name: `Condomínio ${i}`,
				addressId,
			})

			await inMemoryCondominiumsRepository.create(condominium)
		}

		const response = await sut.execute({
			managerId: manager.id,
		})

		expect(response.isRight()).toBe(true)

		if (response.isRight()) {
			const { manager } = response.result

			expect(manager).toMatchObject(
				expect.objectContaining({
					id: 'mock-id',
					name: 'Guilherme Sanches',
					email: 'guilherme@example.com',
				}),
			)
			expect(manager.condominiums).toHaveLength(3)
			expect(manager.condominiums).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: 'Condomínio 1',
						address: {
							id: new UniqueEntityId('address-1'),
							city: 'Cidade 1',
						},
					}),
					expect.objectContaining({
						name: 'Condomínio 2',
						address: {
							id: new UniqueEntityId('address-2'),
							city: 'Cidade 2',
						},
					}),
					expect.objectContaining({
						name: 'Condomínio 3',
						address: {
							id: new UniqueEntityId('address-3'),
							city: 'Cidade 3',
						},
					}),
				]),
			)
		}
	})

	it('should not be able to get a manager profile if the manager does not exist', async () => {
		const response = await sut.execute({
			managerId: new UniqueEntityId('mock-id'),
		})

		if (response.isLeft()) {
			const { reason } = response

			expect(reason).toBeInstanceOf(ManagerNotFoundError)
		}
	})
})
