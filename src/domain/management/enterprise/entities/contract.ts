import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { ContractAttachmentList } from './contract-attachment-list'
import { Slug } from './value-objects/slug'

export interface ContractProps {
	maintenanceId: UniqueEntityId
	title: string
	slug: Slug
	description: string
	isValid: boolean
	startVigencyDate: Date
	endVigencyDate: Date
	attachments: ContractAttachmentList
	createdAt: Date
	updatedAt?: Date
}

export class Contract extends Entity<ContractProps> {
	get maintenanceId(): UniqueEntityId {
		return this.props.maintenanceId
	}

	set maintenanceId(maintenanceId: UniqueEntityId) {
		this.props.maintenanceId = maintenanceId
	}

	get title(): string {
		return this.props.title
	}

	get description(): string {
		return this.props.description
	}

	get isValid(): boolean {
		return this.props.isValid
	}

	set isValid(isValid: boolean) {
		this.props.isValid = isValid
	}

	invalidate() {
		this.isValid = false
		this.touch()
	}

	get startVigencyDate(): Date {
		return this.props.startVigencyDate
	}

	set startVigencyDate(date: Date) {
		this.props.startVigencyDate = date
	}

	get endVigencyDate(): Date {
		return this.props.endVigencyDate
	}

	set endVigencyDate(date: Date) {
		this.props.endVigencyDate = date
	}

	get attachments(): ContractAttachmentList {
		return this.props.attachments
	}

	set attachments(attachments: ContractAttachmentList) {
		this.props.attachments = attachments
		this.touch()
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date | undefined {
		return this.props.updatedAt
	}

	touch() {
		this.props.updatedAt = new Date()
	}

	static create(
		props: Optional<ContractProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const contract = new Contract(
			{
				...props,
				attachments: props.attachments ?? new ContractAttachmentList([]),
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return contract
	}
}
