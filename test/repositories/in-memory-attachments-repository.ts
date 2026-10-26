import { AttachmentsRepository } from '@/domain/management/application/repositories/attachments-repository'
import { Attachment } from '@/domain/management/enterprise/entities/attachment'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
	public items: Attachment[] = []

	async create(attachment: Attachment) {
		this.items.push(attachment)
	}
}
