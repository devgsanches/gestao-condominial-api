import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface MeetingProps {
	condominiumId: UniqueEntityId
	title: string
	description: string
	createdAt: Date
	updatedAt?: Date
}

export class Meeting extends Entity<MeetingProps> {
	get condominiumId(): UniqueEntityId {
		return this.props.condominiumId
	}

	get title(): string {
		return this.props.title
	}

	get description(): string {
		return this.props.description
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date | undefined {
		return this.props.updatedAt
	}

	static create(
		props: Optional<MeetingProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const meeting = new Meeting(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return meeting
	}
}
