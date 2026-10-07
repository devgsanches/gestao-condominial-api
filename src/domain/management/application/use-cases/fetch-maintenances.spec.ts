import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { FetchMaintenancesUseCase, MaintenanceType } from './fetch-maintenances'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { makeCondominium } from '@/test/factories/make-condominium'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { makeMaintenance } from '@/test/factories/make-maintenance'

// @TODO: Add coverage and test all possible errors

describe('FetchMaintenancesUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository

	let sut: FetchMaintenancesUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository()

		sut = new FetchMaintenancesUseCase(inMemoryCondominiumsRepository, inMemoryMaintenancesRepository) // system under test
	})

	it('should be possible for a manager to fetch all maintenances at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 3; i++) {
			await inMemoryMaintenancesRepository.create(makeMaintenance({
				condominiumId: condominium.id,
			}))

			await inMemoryMaintenancesRepository.create(makeMaintenance({
				condominiumId: new UniqueEntityId(),
			}))
		}

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.maintenances).toHaveLength(3)
		}
	})

	it('should be possible for a manager to fetch all periodic maintenances at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 3; i++) {
			await inMemoryMaintenancesRepository.create(makeMaintenance({
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
			}))

			await inMemoryMaintenancesRepository.create(makeMaintenance({
				condominiumId: condominium.id,
			}))
		}

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.maintenances).toHaveLength(3)
		}
	})

	it('should be possible for a manager to fetch all general maintenances at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 3; i++) {
			await inMemoryMaintenancesRepository.create(makeMaintenance({
				condominiumId: condominium.id,
				title: `Título da manutenção ${i}`,
				type: MaintenanceType.PERIODIC,
			}))

			await inMemoryMaintenancesRepository.create(makeMaintenance({
				condominiumId: condominium.id,
			}))
		}

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.maintenances).toHaveLength(3)
		}
	})

	it('should be possible for a manager to fetch a maintenance by title at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 3; i++) {
			await inMemoryMaintenancesRepository.create(makeMaintenance({
				condominiumId: condominium.id,
				title: `Título da manutenção ${i}`,
			}))
		}

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			title: 'Título da manutenção 1'
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.maintenances).toHaveLength(1)
		}
	})
})
