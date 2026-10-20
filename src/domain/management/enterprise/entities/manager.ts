import { UserRole } from '@generated/prisma/enums'
import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface ManagerProps {
	name: string
	email: string
	password: string
	role: UserRole
	createdAt: Date
	updatedAt?: Date | null
}

export class Manager extends Entity<ManagerProps> {
	get name(): string {
		return this.props.name
	}

	get email(): string {
		return this.props.email
	}

	get password(): string {
		return this.props.password
	}

	get role(): UserRole {
		return this.props.role
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date | null | undefined {
		return this.props.updatedAt
	}

	static create(
		props: Optional<ManagerProps, 'createdAt' | 'role'>,
		id?: UniqueEntityId,
	) {
		const manager = new Manager(
			{
				...props,
				role: UserRole.CONDOMINIUM_MANAGER,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return manager
	}
}
