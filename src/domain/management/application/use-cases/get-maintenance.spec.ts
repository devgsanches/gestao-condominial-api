import { MaintenanceType } from '@generated/prisma/enums'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeContract } from '@/test/factories/make-contract'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryContractAttachmentsRepository } from '@/test/repositories/in-memory-contract-attachments'
import { InMemoryContractsRepository } from '@/test/repositories/in-memory-contracts-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { Attachment } from '../../enterprise/entities/attachment'
import { ContractAttachment } from '../../enterprise/entities/contract-attachment'
import { ContractAttachmentList } from '../../enterprise/entities/contract-attachment-list'
import { GetMaintenanceUseCase } from './get-maintenance'

describe('GetMaintenanceUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryContractsRepository: InMemoryContractsRepository
	let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository

	let sut: GetMaintenanceUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryContractsRepository = new InMemoryContractsRepository(
			new InMemoryContractAttachmentsRepository(),
		)
		inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository(
			inMemoryContractsRepository,
			inMemoryAttachmentsRepository,
		)

		sut = new GetMaintenanceUseCase(
			inMemoryCondominiumsRepository,
			inMemoryMaintenancesRepository,
		)
	})

	it('should return the maintenance with its contract and attachments', async () => {
		const managerId = new UniqueEntityId()
		const condominium = makeCondominium({ managerId })
		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
			periodicity: 'month',
		})
		await inMemoryMaintenancesRepository.create(maintenance)

		const attachment = Attachment.create({
			title: 'contrato_assinado.pdf',
			url: 'contrato-assinado.pdf',
		})
		await inMemoryAttachmentsRepository.create(attachment)

		const contract = makeContract({ maintenanceId: maintenance.id })
		contract.attachments = new ContractAttachmentList([
			ContractAttachment.create({
				contractId: contract.id,
				attachmentId: attachment.id,
				createdAt: new Date(),
			}),
		])
		await inMemoryContractsRepository.create(contract)

		const response = await sut.execute({
			managerId,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			const { details } = response.result

			expect(details.maintenance.id).toEqual(maintenance.id)
			expect(details.contract?.id).toEqual(contract.id)
			expect(details.attachments).toEqual([attachment])
		}
	})

	it('should return a maintenance without contract', async () => {
		const managerId = new UniqueEntityId()
		const condominium = makeCondominium({ managerId })
		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({ condominiumId: condominium.id })
		await inMemoryMaintenancesRepository.create(maintenance)

		const response = await sut.execute({
			managerId,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(response.result.details.contract).toBeNull()
			expect(response.result.details.attachments).toEqual([])
		}
	})

	it('should not return a maintenance to someone who is not the manager', async () => {
		const condominium = makeCondominium()
		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({ condominiumId: condominium.id })
		await inMemoryMaintenancesRepository.create(maintenance)

		const response = await sut.execute({
			managerId: new UniqueEntityId(),
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})

	it('should not return a maintenance from another condominium', async () => {
		const managerId = new UniqueEntityId()
		const condominium = makeCondominium({ managerId })
		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({ condominiumId: new UniqueEntityId() })
		await inMemoryMaintenancesRepository.create(maintenance)

		const response = await sut.execute({
			managerId,
			condominiumId: condominium.id,
			maintenanceId: maintenance.id,
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})
})
