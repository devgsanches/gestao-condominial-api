import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Contract,
	ContractProps,
} from '@/domain/management/enterprise/entities/contract'
import { ContractAttachmentList } from '@/domain/management/enterprise/entities/contract-attachment-list'

export function makeContract(
	override: Partial<ContractProps> = {},
	id?: UniqueEntityId,
) {
	const contract = Contract.create(
		{
			maintenanceId: new UniqueEntityId(),
			title: faker.lorem.words(4),
			description: faker.lorem.paragraph(),
			supplierName: faker.company.name(),
			supplierCnpj: faker.string.numeric(14),
			valueInCents: faker.number.int({ min: 10_000, max: 500_000 }),
			isValid: true,
			startVigencyDate: faker.date.recent(),
			endVigencyDate: faker.date.future(),
			attachments: new ContractAttachmentList([]),
			createdAt: new Date(),
			...override,
		},
		id,
	)

	return contract
}
