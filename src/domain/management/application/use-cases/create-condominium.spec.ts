import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAdmin } from '@/test/factories/make-admin'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAdminsRepository } from '@/test/repositories/in-memory-admins-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { CreateCondominiumUseCase } from './create-condominium'

describe('CreateCondominiumUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryManagersRepository: InMemoryManagersRepository
	let inMemoryAdminsRepository: InMemoryAdminsRepository
	let sut: CreateCondominiumUseCase

	beforeEach(() => {
		inMemoryAdminsRepository = new InMemoryAdminsRepository()
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository(
			undefined,
			undefined,
			undefined,
			inMemoryAdminsRepository,
		)
		inMemoryManagersRepository = new InMemoryManagersRepository()

		sut = new CreateCondominiumUseCase(
			inMemoryCondominiumsRepository,
			inMemoryManagersRepository,
			inMemoryAdminsRepository,
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

	it('should link every admin to the newly created condominium.', async () => {
		const manager = makeManager()
		const firstAdmin = makeAdmin()
		const secondAdmin = makeAdmin()

		await inMemoryManagersRepository.create(manager)
		await inMemoryAdminsRepository.create(firstAdmin)
		await inMemoryAdminsRepository.create(secondAdmin)

		const response = await sut.execute({
			managerId: manager.id,
			addressId: new UniqueEntityId(),
			name: 'Condomínio do Guilherme',
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			const { condominium } = response.result

			await expect(
				inMemoryAdminsRepository.isAdminOfCondominium(
					firstAdmin.id,
					condominium.id,
				),
			).resolves.toBe(true)
			await expect(
				inMemoryAdminsRepository.isAdminOfCondominium(
					secondAdmin.id,
					condominium.id,
				),
			).resolves.toBe(true)
		}
	})
})
