import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface ContractAttachmentProps {
	contractId: UniqueEntityId
	attachmentId: UniqueEntityId
	createdAt: Date
	updatedAt?: Date
}

export class ContractAttachment extends Entity<ContractAttachmentProps> {
	get contractId() {
		return this.props.contractId
	}

	get attachmentId() {
		return this.props.attachmentId
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	static create(props: ContractAttachmentProps, id?: UniqueEntityId) {
		const contractAttachment = new ContractAttachment(props, id)

		return contractAttachment
	}
}
