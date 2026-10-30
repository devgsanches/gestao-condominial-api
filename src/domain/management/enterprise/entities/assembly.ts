import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface AssemblyProps {
	condominiumId: UniqueEntityId
	title: string
	description: string
	location?: string | null
	scheduledAt: Date
	canceledAt?: Date
	createdAt: Date
	updatedAt?: Date
}

export class Assembly extends Entity<AssemblyProps> {
	get condominiumId(): UniqueEntityId {
		return this.props.condominiumId
	}

	get title(): string {
		return this.props.title
	}

	get description(): string {
		return this.props.description
	}

	get location(): string | null {
		return this.props.location ?? null
	}

	get scheduledAt(): Date {
		return this.props.scheduledAt
	}

	get canceledAt(): Date | undefined {
		return this.props.canceledAt
	}

	set canceledAt(canceledAt: Date | undefined) {
		this.props.canceledAt = canceledAt
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date | undefined {
		return this.props.updatedAt
	}

	static create(
		props: Optional<AssemblyProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const assembly = new Assembly(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return assembly
	}
}
