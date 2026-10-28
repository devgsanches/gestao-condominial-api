import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Attachment } from '../../enterprise/entities/attachment'

export abstract class AttachmentsRepository {
	abstract create(attachment: Attachment): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Attachment | null>
}
