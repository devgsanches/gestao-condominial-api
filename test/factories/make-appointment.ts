import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Assembly,
	AssemblyProps,
} from '@/domain/management/enterprise/entities/assembly'
import {
	Meeting,
	MeetingProps,
} from '@/domain/management/enterprise/entities/meeting'

export function makeAppointment(
	type: 'meeting' | 'assembly',
	override: Partial<MeetingProps | AssemblyProps> = {},
	id?: UniqueEntityId,
) {
	if (type === 'meeting') {
		const meeting = Meeting.create(
			{
				condominiumId: new UniqueEntityId(),
				title: faker.lorem.sentence(),
				description: faker.lorem.paragraph(),
				scheduledAt: faker.date.future(),
				...override,
			},
			id,
		)
		return meeting
	} else {
		const assembly = Assembly.create(
			{
				condominiumId: new UniqueEntityId(),
				title: faker.lorem.sentence(),
				description: faker.lorem.paragraph(),
				scheduledAt: faker.date.future(),
				...override,
			},
			id,
		)

		return assembly
	}
}
