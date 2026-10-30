import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Attachment } from '@/domain/management/enterprise/entities/attachment'

type AttachmentOverride = Partial<{
	title: string
	url: string
	createdAt: Date
}>

export function makeAttachment(
	override: AttachmentOverride = {},
	id?: UniqueEntityId,
) {
	return Attachment.create(
		{
			title: faker.system.fileName(),
			url: faker.string.uuid(),
			...override,
		},
		id,
	)
}
