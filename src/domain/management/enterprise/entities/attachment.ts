import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

interface AttachmentProps {
	title: string
	url: string
	createdAt: Date
	updatedAt?: Date
}

export class Attachment extends Entity<AttachmentProps> {
	get title() {
		return this.props.title
	}

	get url() {
		return this.props.url
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	static create(
		props: Optional<AttachmentProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const attachment = new Attachment(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return attachment
	}
}
