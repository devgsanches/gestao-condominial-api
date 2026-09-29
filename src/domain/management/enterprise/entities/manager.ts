import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

interface ManagerProps {
	name: string
}

export class Manager extends Entity<ManagerProps> {
	get name(): string {
		return this.props.name
	}

	static create(props: ManagerProps, id?: UniqueEntityId) {
		const manager = new Manager(
			{
				...props,
			},
			id,
		)

		return manager
	}
}
