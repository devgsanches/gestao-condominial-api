import { MaintenanceType } from '@generated/prisma/enums'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { CreateMaintenanceUseCase } from './create-maintenance'

// @TODO: Add coverage and test all possible errors

describe('CreateMaintenanceUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository
	let sut: CreateMaintenanceUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository()

		sut = new CreateMaintenanceUseCase(
			inMemoryCondominiumsRepository,
			inMemoryMaintenancesRepository,
		) // system under test
	})

	it('should be possible for a manager to create a general maintenance at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			title: 'Título da manutenção',
			description: 'Descrição da manutenção',
			periodicity: 'month',
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			const { maintenance } = response.result

			expect(maintenance).toMatchObject({
				id: expect.any(UniqueEntityId),
				condominiumId: expect.any(UniqueEntityId),
				title: 'Título da manutenção',
				description: 'Descrição da manutenção',
				type: MaintenanceType.GENERAL,
				periodicity: null,
			})
		}
	})

	it('should be possible for a manager to create a periodic maintenance at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			title: 'Título da manutenção',
			description: 'Descrição da manutenção',
			type: MaintenanceType.PERIODIC,
			periodicity: 'semester',
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result).toMatchObject({
				maintenance: expect.objectContaining({
					id: expect.any(UniqueEntityId),
					condominiumId: expect.any(UniqueEntityId),
					title: 'Título da manutenção',
					description: 'Descrição da manutenção',
					type: MaintenanceType.PERIODIC,
					periodicity: 'semester',
				}),
			})
		}
	})

	it('should be not possible for a manager to create a maintenance at a condominium that does not exist.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: new UniqueEntityId(),
			title: 'Título da manutenção',
			description: 'Descrição da manutenção',
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})

	it('should be not possible for a manager to create a maintenance at a condominium that is not theirs.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: new UniqueEntityId(),
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			title: 'Título da manutenção',
			description: 'Descrição da manutenção',
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})
})
