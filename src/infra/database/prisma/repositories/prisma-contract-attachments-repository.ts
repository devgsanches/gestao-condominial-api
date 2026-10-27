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

	async create(contractAttachment: ContractAttachment): Promise<void> {
		const data = PrismaContractAttachmentMapper.toPrisma(contractAttachment)

		await this.prisma.contractAttachment.create({
			data,
		})
	}
}
