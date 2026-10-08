import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface ContractProps {
	maintenanceId: UniqueEntityId
	title: string
	description: string
	isValid: boolean
	startVigencyDate: Date
	endVigencyDate: Date
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

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date | undefined {
		return this.props.updatedAt
	}

	static create(
		props: Optional<ContractProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const contract = new Contract(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return contract
	}
}
