import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

export type CondominiumWithAddress = {
	condominiumId: UniqueEntityId
	name: string
	address: {
		id: UniqueEntityId
		city: string
	}
	createdAt: Date
	updatedAt?: Date | null
}

export interface ManagerWithCondominiumsProps {
	managerId: UniqueEntityId
	name: string
	email: string
	condominiums: CondominiumWithAddress[]
	createdAt: Date
	updatedAt?: Date | null
}

export class ManagerWithCondominiums extends ValueObject<ManagerWithCondominiumsProps> {
	get managerId() {
		return this.props.managerId
	}

	get name() {
		return this.props.name
	}

	get email() {
		return this.props.email
	}

	get condominiums() {
		return this.props.condominiums
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	static create(props: ManagerWithCondominiumsProps) {
		return new ManagerWithCondominiums(props)
	}
}
