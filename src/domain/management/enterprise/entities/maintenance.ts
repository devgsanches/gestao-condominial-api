import { MaintenanceType } from '@generated/prisma/enums'
import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface MaintenanceProps {
	condominiumId: UniqueEntityId
	type: MaintenanceType
	periodicity: 'month' | 'trimester' | 'semester' | null
	title: string
	description: string
	scheduledAt: Date
	canceledAt?: Date
	createdAt: Date
	updatedAt?: Date
}

export class Maintenance extends Entity<MaintenanceProps> {
	get condominiumId(): UniqueEntityId {
		return this.props.condominiumId
	}

	get type(): MaintenanceType {
		return this.props.type
	}

	get periodicity(): 'month' | 'trimester' | 'semester' | null {
		return this.props.periodicity
	}

	get title(): string {
		return this.props.title
	}

	set title(title: string) {
		this.props.title = title
	}

	get description(): string {
		return this.props.description
	}

	set description(description: string) {
		this.props.description = description
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
		props: Optional<MaintenanceProps, 'createdAt' | 'scheduledAt'>,
		id?: UniqueEntityId,
	) {
		const maintenance = new Maintenance(
			{
				...props,
				scheduledAt: props.scheduledAt ?? new Date(),
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return maintenance
	}
}
