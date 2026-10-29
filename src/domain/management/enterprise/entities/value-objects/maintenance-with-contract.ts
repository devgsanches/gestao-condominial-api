import { MaintenanceType } from '@generated/prisma/enums'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

export interface MaintenanceWithContractProps {
	maintenanceId: UniqueEntityId
	condominiumId: UniqueEntityId
	type: MaintenanceType
	periodicity: 'month' | 'trimester' | 'semester' | null
	contractId: UniqueEntityId | null
	title: string
	canceledAt?: Date
	createdAt: Date
	updatedAt?: Date
}

export class MaintenanceWithContract extends ValueObject<MaintenanceWithContractProps> {
	get maintenanceId() {
		return this.props.maintenanceId
	}

	get condominiumId() {
		return this.props.condominiumId
	}

	get type() {
		return this.props.type
	}

	get periodicity() {
		return this.props.periodicity
	}

	get contractId() {
		return this.props.contractId
	}

	get title() {
		return this.props.title
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

	static create(props: MaintenanceWithContractProps) {
		return new MaintenanceWithContract(props)
	}
}
