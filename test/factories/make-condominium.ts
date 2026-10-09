import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Condominium,
	CondominiumProps,
} from '@/domain/management/enterprise/entities/condominium'
import { Slug } from '@/domain/management/enterprise/entities/value-objects/slug'

export function makeCondominium(
	override: Partial<CondominiumProps> = {},
	id?: UniqueEntityId,
) {
	const name = faker.company.name()

	const condominium = Condominium.create(
		{
			managerId: new UniqueEntityId(),
			addressId: new UniqueEntityId(),
			name,
			slug: Slug.createFromText(name),
			createdAt: new Date(),
			...override,
		},
		id,
	)

	return condominium
}
