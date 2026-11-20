import { MaintenanceType } from '@generated/prisma/enums'
import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAdmin } from '@/test/factories/make-admin'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeContract } from '@/test/factories/make-contract'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAdminsRepository } from '@/test/repositories/in-memory-admins-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryContractAttachmentsRepository } from '@/test/repositories/in-memory-contract-attachments'
import { InMemoryContractsRepository } from '@/test/repositories/in-memory-contracts-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { FetchMaintenancesUseCase } from './fetch-maintenances'

// @TODO: Add coverage and test all possible errors

describe('FetchMaintenancesUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryContractsRepository: InMemoryContractsRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository
	let inMemoryAdminsRepository: InMemoryAdminsRepository

	let sut: FetchMaintenancesUseCase

	beforeEach(() => {
		inMemoryAdminsRepository = new InMemoryAdminsRepository()
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryContractsRepository = new InMemoryContractsRepository(
			new InMemoryContractAttachmentsRepository(),
		)
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository(
			inMemoryContractsRepository,
		)

		sut = new FetchMaintenancesUseCase(
			inMemoryCondominiumsRepository,
			inMemoryMaintenancesRepository,
			inMemoryAdminsRepository,
		) // system under test
	})

	it('should allow an admin linked to the condominium to fetch maintenances.', async () => {
		const admin = makeAdmin()
		const condominium = makeCondominium({ managerId: new UniqueEntityId() })

		await inMemoryCondominiumsRepository.create(condominium)
		await inMemoryAdminsRepository.create(admin)
		await inMemoryAdminsRepository.linkToCondominium(admin.id, condominium.id)

		await inMemoryMaintenancesRepository.create(
			makeMaintenance({ condominiumId: condominium.id }),
		)

		const response = await sut.execute({
			managerId: admin.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(response.result.maintenances).toHaveLength(1)
		}
	})

	it('should not allow an admin not linked to the condominium to fetch maintenances.', async () => {
		const admin = makeAdmin()
		const condominium = makeCondominium({ managerId: new UniqueEntityId() })

		await inMemoryCondominiumsRepository.create(condominium)
		await inMemoryAdminsRepository.create(admin)

		const response = await sut.execute({
			managerId: admin.id,
			condominiumId: condominium.id,
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
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
			await inMemoryMaintenancesRepository.create(
				makeMaintenance({
					condominiumId: condominium.id,
				}),
			)

			await inMemoryMaintenancesRepository.create(
				makeMaintenance({
					condominiumId: new UniqueEntityId(),
				}),
			)
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
			await inMemoryMaintenancesRepository.create(
				makeMaintenance({
					condominiumId: condominium.id,
					type: MaintenanceType.PERIODIC,
				}),
			)

			await inMemoryMaintenancesRepository.create(
				makeMaintenance({
					condominiumId: condominium.id,
				}),
			)
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
			await inMemoryMaintenancesRepository.create(
				makeMaintenance({
					condominiumId: condominium.id,
					title: `Título da manutenção ${i}`,
					type: MaintenanceType.PERIODIC,
				}),
			)

			await inMemoryMaintenancesRepository.create(
				makeMaintenance({
					condominiumId: condominium.id,
				}),
			)
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
			await inMemoryMaintenancesRepository.create(
				makeMaintenance({
					condominiumId: condominium.id,
					title: `Título da manutenção ${i}`,
				}),
			)
		}

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			title: 'Título da manutenção 1',
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.maintenances).toHaveLength(1)
		}
	})

	it('should paginate maintenances 20 per page', async () => {
		const manager = makeManager()
		const condominium = makeCondominium({ managerId: manager.id })

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 22; i++) {
			await inMemoryMaintenancesRepository.create(
				makeMaintenance({ condominiumId: condominium.id }),
			)
		}

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			page: 2,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(response.result).toMatchObject({
				page: 2,
				perPage: 20,
				total: 22,
			})
			expect(response.result.maintenances).toHaveLength(2)
		}
	})

	it('should fetch only active periodic maintenances without contract', async () => {
		const manager = makeManager()
		const condominium = makeCondominium({ managerId: manager.id })

		await inMemoryCondominiumsRepository.create(condominium)

		const withoutContract = makeMaintenance({
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
			periodicity: 'month',
		})
		const withContract = makeMaintenance({
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
			periodicity: 'month',
		})
		const canceled = makeMaintenance({
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
			periodicity: 'month',
			canceledAt: new Date(),
		})
		const general = makeMaintenance({ condominiumId: condominium.id })

		for (const maintenance of [
			withoutContract,
			withContract,
			canceled,
			general,
		]) {
			await inMemoryMaintenancesRepository.create(maintenance)
		}

		await inMemoryContractsRepository.create(
			makeContract({ maintenanceId: withContract.id }),
		)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			withoutContract: true,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(response.result.total).toBe(1)
			expect(response.result.maintenances[0].maintenanceId).toEqual(
				withoutContract.id,
			)
		}
	})

	it('should list active maintenances before canceled ones', async () => {
		const manager = makeManager()
		const condominium = makeCondominium({ managerId: manager.id })

		await inMemoryCondominiumsRepository.create(condominium)

		const canceled = makeMaintenance({
			condominiumId: condominium.id,
			canceledAt: new Date(),
		})
		const active = makeMaintenance({ condominiumId: condominium.id })

		await inMemoryMaintenancesRepository.create(canceled)
		await inMemoryMaintenancesRepository.create(active)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(response.result.maintenances.map((m) => m.maintenanceId)).toEqual([
				active.id,
				canceled.id,
			])
		}
	})
})
