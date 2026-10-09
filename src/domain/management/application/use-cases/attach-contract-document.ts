import { NotFoundException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Contract } from '../../enterprise/entities/contract'
import { ContractAttachment } from '../../enterprise/entities/contract-attachment'
import { ContractAttachmentList } from '../../enterprise/entities/contract-attachment-list'
import { IContractsRepository } from '../repositories/contracts-repository'

interface AttachContractDocumentUseCaseRequest {
	contractId: UniqueEntityId
	attachmentsIds: UniqueEntityId[]
}

type AttachContractDocumentUseCaseResponse = Either<
	NotFoundException,
	{
		contract: Contract
	}
>

export class AttachContractDocumentUseCase {
	constructor(private contractsRepository: IContractsRepository) {}

	async execute({
		contractId,
		attachmentsIds,
	}: AttachContractDocumentUseCaseRequest): Promise<AttachContractDocumentUseCaseResponse> {
		const contract = await this.contractsRepository.findById(contractId)

		const contractAttachments = attachmentsIds.map((attachmentId) =>
			ContractAttachment.create({
				attachmentId,
				contractId,
			}),
		)

		if (!contract) {
			return left(new NotFoundException('Contract not found'))
		}

		contract.attachments = new ContractAttachmentList(contractAttachments)

		await this.contractsRepository.save(contract)

		return right({ contract })
	}
}
