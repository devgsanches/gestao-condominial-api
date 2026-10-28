import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AttachmentsRepository } from '@/domain/management/application/repositories/attachments-repository'
import { Attachment } from '@/domain/management/enterprise/entities/attachment'
import { PrismaAttachmentMapper } from '../mappers/prisma-attachment-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(attachment: Attachment): Promise<void> {
		const data = PrismaAttachmentMapper.toPrisma(attachment)

		await this.prisma.attachment.create({
			data,
		})
	}

	async findById(id: UniqueEntityId): Promise<Attachment | null> {
		const attachment = await this.prisma.attachment.findUnique({
			where: {
				id: id.toString(),
			},
		})

		if (!attachment) {
			return null
		}

		return PrismaAttachmentMapper.toDomain(attachment)
	}
}
