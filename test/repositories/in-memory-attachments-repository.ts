import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AttachmentsRepository } from '@/domain/management/application/repositories/attachments-repository'
import { Attachment } from '@/domain/management/enterprise/entities/attachment'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
	public items: Attachment[] = []

	async create(attachment: Attachment) {
		this.items.push(attachment)
	}

	async findById(id: UniqueEntityId) {
		const attachment = this.items.find((item) => item.id.equals(id))

		if (!attachment) {
			return null
		}

		return attachment
	}
}
