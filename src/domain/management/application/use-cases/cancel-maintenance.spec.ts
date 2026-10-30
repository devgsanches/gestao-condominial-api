import { MaintenanceType } from '@generated/prisma/enums'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeContract } from '@/test/factories/make-contract'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryContractAttachmentsRepository } from '@/test/repositories/in-memory-contract-attachments'
import { InMemoryContractsRepository } from '@/test/repositories/in-memory-contracts-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { CancelMaintenanceUseCase } from './cancel-maintenance'

// @TODO: Add coverage and test all possible errors

describe('CancelMaintenanceUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository

	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository

	let inMemoryContractsRepository: InMemoryContractsRepository

	let sut: CancelMaintenanceUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository()
		inMemoryContractsRepository = new InMemoryContractsRepository(
			new InMemoryContractAttachmentsRepository(),
		)

		sut = new CancelMaintenanceUseCase(
			inMemoryCondominiumsRepository,
			inMemoryMaintenancesRepository,
			inMemoryContractsRepository,
		) // system under test
	})

	it('should be possible for a manager to cancel periodic maintenance at a condominium and void the contract.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			title: 'Título da manutenção',
			description: 'Descrição da manutenção',
			type: MaintenanceType.PERIODIC,
		})

		await inMemoryMaintenancesRepository.create(maintenance)

		const contract = makeContract({
			maintenanceId: maintenance.id,
		})

		await inMemoryContractsRepository.create(contract)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
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
				canceledAt: expect.any(Date),
			})
			expect(inMemoryContractsRepository.items[0].isValid).toBe(false)
		}
	})

	it('should be possible for a manager to cancel general maintenance at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Test',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			title: 'Título da manutenção',
			description: 'Descrição da manutenção',
			type: MaintenanceType.PERIODIC,
		})

		await inMemoryMaintenancesRepository.create(maintenance)

		const contract = makeContract({
			maintenanceId: maintenance.id,
		})

		await inMemoryContractsRepository.create(contract)

		const generalMaintenance = makeMaintenance({
			condominiumId: condominium.id,
			title: 'Título da manutenção geral',
			description: 'Descrição da manutenção geral',
		})

		await inMemoryMaintenancesRepository.create(generalMaintenance)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: generalMaintenance.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			const { maintenance } = response.result

			expect(maintenance).toMatchObject({
				id: expect.any(UniqueEntityId),
				condominiumId: expect.any(UniqueEntityId),
				title: 'Título da manutenção geral',
				description: 'Descrição da manutenção geral',
				canceledAt: expect.any(Date),
			})
			expect(inMemoryContractsRepository.items[0].isValid).toBe(true)
		}
	})

	it('should be not possible for a manager to cancel a maintenance at a condominium that does not exist.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: new UniqueEntityId(),
			maintenanceId: new UniqueEntityId(),
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})

	it('should be not possible for a manager to cancel a maintenance at a condominium that is not theirs.', async () => {
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
			maintenanceId: new UniqueEntityId(),
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})
})
