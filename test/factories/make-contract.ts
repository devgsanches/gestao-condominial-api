import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Contract,
	ContractProps,
} from '@/domain/management/enterprise/entities/contract'
import { Slug } from '@/domain/management/enterprise/entities/value-objects/slug'

export function makeContract(
	override: Partial<ContractProps> = {},
	id?: UniqueEntityId,
) {
	const title = faker.lorem.words(4)

	const contract = Contract.create(
		{
			maintenanceId: new UniqueEntityId(),
			title,
			slug: Slug.createFromText(title),
			description: faker.lorem.paragraph(),
			isValid: true,
			startVigencyDate: faker.date.recent(),
			endVigencyDate: faker.date.future(),
			createdAt: new Date(),
			...override,
		},
		id,
	)

	return contract
}
