import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Maintenance,
	MaintenanceProps,
} from '@/domain/management/enterprise/entities/maintenance'

export function makeMaintenance(
	override: Partial<MaintenanceProps> = {},
	id?: UniqueEntityId,
) {
	const maintenance = Maintenance.create(
		{
			condominiumId: new UniqueEntityId(),
			type: 'general',
			periodicity: override.periodicity ?? null,
			title: faker.lorem.sentence(),
			description: faker.lorem.paragraph(),
			...override,
		},
		id,
	)

	return maintenance
}
