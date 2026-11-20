import { MaintenanceType } from '@generated/prisma/enums'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAdminsRepository } from '@/test/repositories/in-memory-admins-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { UpdateMaintenanceUseCase } from './update-maintenance'

// @TODO: Add coverage and test all possible errors

describe('UpdateMaintenanceUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository

	let sut: UpdateMaintenanceUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository()

		sut = new UpdateMaintenanceUseCase(
			inMemoryCondominiumsRepository,
			inMemoryMaintenancesRepository,
			new InMemoryAdminsRepository(),
		) // system under test
	})

	it('should be possible for a manager to update a valid maintenance at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			title: 'Manutenção Teste',
			description: 'Descrição da manutenção teste',
		})

		await inMemoryMaintenancesRepository.create(maintenance)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
			title: 'Manutenção Teste Atualizada',
			description: 'Descrição da manutenção teste atualizada',
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			const { maintenance } = response.result

			expect(maintenance).toMatchObject(
				expect.objectContaining({
					id: maintenance.id,
					condominiumId: condominium.id,
					title: 'Manutenção Teste Atualizada',
					description: 'Descrição da manutenção teste atualizada',
					type: MaintenanceType.GENERAL,
					canceledAt: undefined,
				}),
			)
		}
	})

	it('should not be possible for a manager to update a maintenance that does not exist.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: new UniqueEntityId(),
			title: 'Manutenção Teste Atualizada',
			description: 'Descrição da manutenção teste atualizada',
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})

	it('should not be possible for a manager to update a invalid maintenance.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			title: 'Manutenção Teste',
			description: 'Descrição da manutenção teste',
			canceledAt: new Date(),
		})

		await inMemoryMaintenancesRepository.create(maintenance)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
			title: 'Manutenção Teste Atualizada',
			description: 'Descrição da manutenção teste atualizada',
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})

	it('should not be possible for a manager to update a maintenance that is not at a condominium that is theirs.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: new UniqueEntityId(),
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			title: 'Manutenção Teste',
			description: 'Descrição da manutenção teste',
		})

		await inMemoryMaintenancesRepository.create(maintenance)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
			title: 'Manutenção Teste Atualizada',
			description: 'Descrição da manutenção teste atualizada',
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})
})
