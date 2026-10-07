import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Slug } from './value-objects/slug'

export interface CondominiumProps {
	managerId: UniqueEntityId
	addressId: UniqueEntityId
	name: string
	slug: Slug
	createdAt: Date
	updatedAt?: Date
}

export class Condominium extends Entity<CondominiumProps> {
	get managerId(): UniqueEntityId {
		return this.props.managerId
	}

	get addressId(): UniqueEntityId {
		return this.props.addressId
	}

	get name(): string {
		return this.props.name
	}

	set name(name: string) {
		this.props.name = name
	}

	get slug(): Slug {
		return this.props.slug
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date | undefined {
		return this.props.updatedAt
	}

	static create(
		props: Optional<CondominiumProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const condominium = new Condominium(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return condominium
	}
}
