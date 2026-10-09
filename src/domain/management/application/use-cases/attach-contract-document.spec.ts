import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeContract } from '@/test/factories/make-contract'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryContractsRepository } from '@/test/repositories/in-memory-contracts-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { AttachContractDocumentUseCase } from './attach-contract-document'
import { MaintenanceType } from './fetch-maintenances'

describe('AttachContractDocument UseCase', () => {
	let inMemoryContractsRepository: InMemoryContractsRepository
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository

	let sut: AttachContractDocumentUseCase

	beforeEach(() => {
		inMemoryContractsRepository = new InMemoryContractsRepository()
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository()
		sut = new AttachContractDocumentUseCase(inMemoryContractsRepository) // system under test
	})

	it('should be able to attach a document to a contract', async () => {
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

		const contract = makeContract({
			maintenanceId: maintenance.id,
		})

		await inMemoryContractsRepository.create(contract)

		const response = await sut.execute({
			contractId: contract.id,
			attachmentsIds: [
				new UniqueEntityId('attachment-1'),
				new UniqueEntityId('attachment-2'),
				new UniqueEntityId('attachment-3'),
				new UniqueEntityId('attachment-4'),
			],
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)

		if (response.isRight()) {
			const { contract } = response.result

			expect(inMemoryContractsRepository.items[0]).toMatchObject(
				expect.objectContaining({
					id: contract.id,
					maintenanceId: maintenance.id,
				}),
			)
			expect(contract.attachments.currentItems).toHaveLength(4)

			expect(contract.attachments.currentItems).toEqual([
				expect.objectContaining({
					attachmentId: new UniqueEntityId('attachment-1'),
				}),
				expect.objectContaining({
					attachmentId: new UniqueEntityId('attachment-2'),
				}),
				expect.objectContaining({
					attachmentId: new UniqueEntityId('attachment-3'),
				}),
				expect.objectContaining({
					attachmentId: new UniqueEntityId('attachment-4'),
				}),
			])
		}
	})
})
