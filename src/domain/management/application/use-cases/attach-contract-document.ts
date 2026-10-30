import { Injectable, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Attachment } from '../../enterprise/entities/attachment'
import { Contract } from '../../enterprise/entities/contract'
import { ContractAttachment } from '../../enterprise/entities/contract-attachment'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ContractsRepository } from '../repositories/contracts-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'
import { AttachmentNotFoundError } from './errors/attachment-not-found-error'
import { ContractNotFoundError } from './errors/contract-not-found-error'

interface AttachContractDocumentUseCaseRequest {
	managerId: UniqueEntityId
	contractId: UniqueEntityId
	attachmentsIds: UniqueEntityId[]
}

type AttachContractDocumentUseCaseResponse = Either<
	ContractNotFoundError | AttachmentNotFoundError | UnauthorizedException,
	{
		contract: Contract
		attachments: Attachment[]
	}
>

@Injectable()
export class AttachContractDocumentUseCase {
	constructor(
		private contractsRepository: ContractsRepository,
		private maintenancesRepository: MaintenancesRepository,
		private condominiumsRepository: CondominiumsRepository,
		private attachmentsRepository: AttachmentsRepository,
	) {}

	async execute({
		managerId,
		contractId,
		attachmentsIds,
	}: AttachContractDocumentUseCaseRequest): Promise<AttachContractDocumentUseCaseResponse> {
		const contract = await this.contractsRepository.findById(contractId)

		if (!contract) {
			return left(new ContractNotFoundError())
		}

		const maintenance = await this.maintenancesRepository.findById(
			contract.maintenanceId,
		)

		const condominium = maintenance
			? await this.condominiumsRepository.findById(maintenance.condominiumId)
			: null

		if (!condominium?.managerId.equals(managerId)) {
			return left(new UnauthorizedException())
		}

		const newAttachments: Attachment[] = []

		for (const attachmentId of attachmentsIds) {
			const attachment = await this.attachmentsRepository.findById(attachmentId)

			if (!attachment) {
				return left(new AttachmentNotFoundError())
			}

			newAttachments.push(attachment)
		}

		for (const attachmentId of attachmentsIds) {
			contract.attachments.add(
				ContractAttachment.create({
					attachmentId,
					contractId,
					createdAt: new Date(),
				}),
			)
		}

		await this.contractsRepository.save(contract)

		const attachments = await Promise.all(
			contract.attachments.currentItems.map(
				async (contractAttachment) =>
					newAttachments.find((attachment) =>
						attachment.id.equals(contractAttachment.attachmentId),
					) ??
					(await this.attachmentsRepository.findById(
						contractAttachment.attachmentId,
					)),
			),
		)

		return right({
			contract,
			attachments: attachments.filter(
				(attachment): attachment is Attachment => attachment !== null,
			),
		})
	}
}
