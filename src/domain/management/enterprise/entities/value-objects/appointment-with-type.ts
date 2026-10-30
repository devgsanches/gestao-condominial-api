import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

export interface AppointmentWithTypeProps {
	appointmentId: UniqueEntityId
	condominiumId: UniqueEntityId
	type: 'meeting' | 'assembly'
	title: string
	location: string | null
	scheduledAt: Date
	canceledAt?: Date
	createdAt: Date
	updatedAt?: Date
}

export class AppointmentWithType extends ValueObject<AppointmentWithTypeProps> {
	get appointmentId() {
		return this.props.appointmentId
	}

	get condominiumId() {
		return this.props.condominiumId
	}

	get type() {
		return this.props.type
	}

	get title() {
		return this.props.title
	}

	get location() {
		return this.props.location
	}

	get scheduledAt() {
		return this.props.scheduledAt
	}

	get canceledAt() {
		return this.props.canceledAt
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	static create(props: AppointmentWithTypeProps) {
		return new AppointmentWithType(props)
	}
}
