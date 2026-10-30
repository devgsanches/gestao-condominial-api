import { MaintenanceType } from '@generated/prisma/enums'
import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAttachment } from '@/test/factories/make-attachment'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeContract } from '@/test/factories/make-contract'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryContractAttachmentsRepository } from '@/test/repositories/in-memory-contract-attachments'
import { InMemoryContractsRepository } from '@/test/repositories/in-memory-contracts-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import type { Contract } from '../../enterprise/entities/contract'
import { ContractAttachment } from '../../enterprise/entities/contract-attachment'
import { ContractAttachmentList } from '../../enterprise/entities/contract-attachment-list'
import type { Manager } from '../../enterprise/entities/manager'
import { AttachContractDocumentUseCase } from './attach-contract-document'
import { AttachmentNotFoundError } from './errors/attachment-not-found-error'
import { ContractNotFoundError } from './errors/contract-not-found-error'

describe('AttachContractDocument UseCase', () => {
	let inMemoryContractsRepository: InMemoryContractsRepository
	let inMemoryContractAttachmentsRepository: InMemoryContractAttachmentsRepository
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository
	let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository

	let manager: Manager
	let contract: Contract

	let sut: AttachContractDocumentUseCase

	beforeEach(async () => {
		inMemoryContractAttachmentsRepository =
			new InMemoryContractAttachmentsRepository()
		inMemoryContractsRepository = new InMemoryContractsRepository(
			inMemoryContractAttachmentsRepository,
		)
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository()
		inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

		sut = new AttachContractDocumentUseCase(
			inMemoryContractsRepository,
			inMemoryMaintenancesRepository,
			inMemoryCondominiumsRepository,
			inMemoryAttachmentsRepository,
		) // system under test

		manager = makeManager()

		const condominium = makeCondominium({ managerId: manager.id })
		await inMemoryCondominiumsRepository.create(condominium)

		const maintenance = makeMaintenance({
			condominiumId: condominium.id,
			type: MaintenanceType.PERIODIC,
		})
		await inMemoryMaintenancesRepository.create(maintenance)

		contract = makeContract({ maintenanceId: maintenance.id })
		await inMemoryContractsRepository.create(contract)

		for (const id of ['attachment-1', 'attachment-2', 'attachment-3']) {
			await inMemoryAttachmentsRepository.create(
				makeAttachment({ title: `${id}.pdf` }, new UniqueEntityId(id)),
			)
		}
	})

	it('should be able to attach documents to a contract and return their metadata', async () => {
		const response = await sut.execute({
			managerId: manager.id,
			contractId: contract.id,
			attachmentsIds: [
				new UniqueEntityId('attachment-1'),
				new UniqueEntityId('attachment-2'),
			],
		})

		expect(response.isRight()).toBe(true)

		if (response.isRight()) {
			const { contract, attachments } = response.result

			expect(contract.attachments.currentItems).toHaveLength(2)
			expect(attachments).toEqual([
				expect.objectContaining({ title: 'attachment-1.pdf' }),
				expect.objectContaining({ title: 'attachment-2.pdf' }),
			])
		}
	})

	it('should keep the documents already linked when attaching a new one', async () => {
		const linkedAttachment = ContractAttachment.create(
			{
				attachmentId: new UniqueEntityId('attachment-1'),
				contractId: contract.id,
				createdAt: new Date(),
			},
			new UniqueEntityId('pivot-1'),
		)

		const contractWithAttachment = makeContract(
			{
				maintenanceId: contract.maintenanceId,
				attachments: new ContractAttachmentList([linkedAttachment]),
			},
			contract.id,
		)

		inMemoryContractsRepository.items = [contractWithAttachment]
		inMemoryContractAttachmentsRepository.items.push(linkedAttachment)

		const response = await sut.execute({
			managerId: manager.id,
			contractId: contract.id,
			attachmentsIds: [
				new UniqueEntityId('attachment-1'),
				new UniqueEntityId('attachment-3'),
			],
		})

		expect(response.isRight()).toBe(true)
		expect(inMemoryContractAttachmentsRepository.items).toHaveLength(2)

		if (response.isRight()) {
			expect(response.result.attachments).toEqual([
				expect.objectContaining({ title: 'attachment-1.pdf' }),
				expect.objectContaining({ title: 'attachment-3.pdf' }),
			])
		}
	})

	it('should not allow attaching documents to a contract from another manager condominium', async () => {
		const response = await sut.execute({
			managerId: new UniqueEntityId('other-manager'),
			contractId: contract.id,
			attachmentsIds: [new UniqueEntityId('attachment-1')],
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
		expect(inMemoryContractAttachmentsRepository.items).toHaveLength(0)
	})

	it('should not attach an attachment that does not exist', async () => {
		const response = await sut.execute({
			managerId: manager.id,
			contractId: contract.id,
			attachmentsIds: [new UniqueEntityId('missing-attachment')],
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(AttachmentNotFoundError)
		}
	})

	it('should return not found when the contract does not exist', async () => {
		const response = await sut.execute({
			managerId: manager.id,
			contractId: new UniqueEntityId('missing-contract'),
			attachmentsIds: [new UniqueEntityId('attachment-1')],
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(ContractNotFoundError)
		}
	})
})
