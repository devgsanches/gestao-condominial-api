import { AggregateRoot } from '@/core/entities/aggregate-root'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { ContractAttachmentList } from './contract-attachment-list'
import { Slug } from './value-objects/slug'

export interface ContractProps {
	maintenanceId: UniqueEntityId
	title?: string | null
	slug: Slug
	description?: string | null
	supplierName: string
	supplierCnpj: string
	valueInCents: number
	isValid: boolean
	startVigencyDate: Date
	endVigencyDate: Date
	attachments: ContractAttachmentList
	createdAt: Date
	updatedAt?: Date
}

export class Contract extends AggregateRoot<ContractProps> {
	get maintenanceId(): UniqueEntityId {
		return this.props.maintenanceId
	}

	set maintenanceId(maintenanceId: UniqueEntityId) {
		this.props.maintenanceId = maintenanceId
	}

	get slug(): Slug {
		return this.props.slug
	}

	get title(): string | null {
		return this.props.title ?? null
	}

	get description(): string | null {
		return this.props.description ?? null
	}

	get supplierName(): string {
		return this.props.supplierName
	}

	get supplierCnpj(): string {
		return this.props.supplierCnpj
	}

	get valueInCents(): number {
		return this.props.valueInCents
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
		props: Optional<ContractProps, 'slug' | 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const contract = new Contract(
			{
				...props,
				slug:
					props.slug ??
					Slug.createFromText(
						`${props.title ?? props.supplierName} ${props.maintenanceId.toString()}`,
					),
				attachments: props.attachments ?? new ContractAttachmentList([]),
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return contract
	}
}
