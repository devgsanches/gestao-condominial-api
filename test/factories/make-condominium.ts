import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Condominium,
	CondominiumProps,
} from '@/domain/management/enterprise/entities/condominium'

export function makeCondominium(
	override: Partial<CondominiumProps> = {},
	id?: UniqueEntityId,
) {
	const condominium = Condominium.create(
		{
			managerId: new UniqueEntityId(),
			addressId: new UniqueEntityId(),
			name: faker.company.name(),
			createdAt: new Date(),
			...override,
		},
		id,
	)

	return condominium
}
