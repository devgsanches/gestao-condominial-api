import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Manager,
	ManagerProps,
} from '@/domain/management/enterprise/entities/manager'

export function makeManager(
	override: Partial<ManagerProps> = {},
	id?: UniqueEntityId,
) {
	const manager = Manager.create(
		{
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
			...override,
		},
		id,
	)

	return manager
}
