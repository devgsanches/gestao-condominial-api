import { BadRequestException, ConflictException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeContract } from '@/test/factories/make-contract'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryContractsRepository } from '@/test/repositories/in-memory-contracts-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { CreateContractUseCase } from './create-contract'
import { MaintenanceType } from './fetch-maintenances'

// @TODO: Add coverage and test all possible errors

describe('CreateContractUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository
	let inMemoryContractsRepository: InMemoryContractsRepository

	let sut: CreateContractUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository()
		inMemoryContractsRepository = new InMemoryContractsRepository()

		sut = new CreateContractUseCase(
			inMemoryCondominiumsRepository,
			inMemoryMaintenancesRepository,
			inMemoryContractsRepository,
		) // system under test
	})

	it('should be possible for a manager to create a periodic maintenance contract for a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
		})

		await inMemoryMaintenancesRepository.create(maintenance)

		const startVigencyDate = new Date()
		const endVigencyDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
			title: 'Contrato de manutenção periódica',
			description: 'Contrato de manutenção periódica para o condomínio',
			startVigencyDate,
			endVigencyDate,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			const { contract } = response.result

			expect(contract).toMatchObject({
				_id: expect.any(UniqueEntityId),
				maintenanceId: maintenance.id,
				title: 'Contrato de manutenção periódica',
				description: 'Contrato de manutenção periódica para o condomínio',
				isValid: true,
				startVigencyDate,
				endVigencyDate,
				createdAt: expect.any(Date),
			})
		}
	})

	it('should not be possible for a manager to create a general maintenance contract for a condominium. contract are valid just on periodic maintenances', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			type: MaintenanceType.GENERAL,
		})

		await inMemoryMaintenancesRepository.create(maintenance)

		const startVigencyDate = new Date()
		const endVigencyDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
			title: 'Contrato de manutenção periódica',
			description: 'Contrato de manutenção periódica para o condomínio',
			startVigencyDate,
			endVigencyDate,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(BadRequestException)
		}
	})

	it('should not be possible to create a contract when the maintenance already has one.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
		})

		await inMemoryMaintenancesRepository.create(maintenance)

		const existingContract = makeContract({
			maintenanceId: maintenance.id,
		})

		await inMemoryContractsRepository.create(existingContract)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
			title: 'Contrato duplicado',
			description: 'Não deve ser criado',
			startVigencyDate: new Date(),
			endVigencyDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(ConflictException)
		}
	})
})
