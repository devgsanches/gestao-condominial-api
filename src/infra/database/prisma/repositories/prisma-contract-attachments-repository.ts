import { Injectable } from '@nestjs/common'
import { ContractAttachmentsRepository } from '@/domain/management/application/repositories/contract-attachments-repository'
import { ContractAttachment } from '@/domain/management/enterprise/entities/contract-attachment'
import { PrismaContractAttachmentMapper } from '../mappers/contract-attachment-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaContractAttachmentsRepository
	implements ContractAttachmentsRepository
{
	constructor(private readonly prisma: PrismaService) {}

	async createMany(attachments: ContractAttachment[]): Promise<void> {
		const data = attachments.map((attachment) =>
			PrismaContractAttachmentMapper.toPrisma(attachment),
		)

		await this.prisma.contractAttachment.createMany({
			data,
		})
	}

	async deleteMany(attachments: ContractAttachment[]): Promise<void> {
		const attachmentIds = attachments.map((attachment) =>
			attachment.id.toString(),
		)

		await this.prisma.contractAttachment.deleteMany({
			where: {
				id: { in: attachmentIds },
			},
		})
	}
}
