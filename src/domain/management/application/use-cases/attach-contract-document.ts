import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Contract } from '../../enterprise/entities/contract'
import { ContractAttachment } from '../../enterprise/entities/contract-attachment'
import { ContractAttachmentList } from '../../enterprise/entities/contract-attachment-list'
import { ContractsRepository } from '../repositories/contracts-repository'
import { ContractNotFoundError } from './errors/contract-not-found-error'

interface AttachContractDocumentUseCaseRequest {
	contractId: UniqueEntityId
	attachmentsIds: UniqueEntityId[]
}

type AttachContractDocumentUseCaseResponse = Either<
	ContractNotFoundError,
	{
		contract: Contract
	}
>

@Injectable()
export class AttachContractDocumentUseCase {
	constructor(private contractsRepository: ContractsRepository) {}

	async execute({
		contractId,
		attachmentsIds,
	}: AttachContractDocumentUseCaseRequest): Promise<AttachContractDocumentUseCaseResponse> {
		const contract = await this.contractsRepository.findById(contractId)

		if (!contract) {
			return left(new ContractNotFoundError())
		}

		const contractAttachments = attachmentsIds.map((attachmentId) =>
			ContractAttachment.create({
				attachmentId,
				contractId,
				createdAt: new Date(),
			}),
		)

		contract.attachments = new ContractAttachmentList(contractAttachments)

		await this.contractsRepository.save(contract)

		return right({ contract })
	}
}
