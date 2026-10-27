import { Prisma } from '@generated/prisma/client'
import { ContractAttachment } from '@/domain/management/enterprise/entities/contract-attachment'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaContractAttachmentMapper {
	static toPrisma(
		contractAttachment: ContractAttachment,
	): Prisma.ContractAttachmentUncheckedCreateInput {
		return {
			id: contractAttachment.id.toString(),
			contractId: contractAttachment.contractId.toString(),
			attachmentId: contractAttachment.attachmentId.toString(),
			createdAt: contractAttachment.createdAt,
			updatedAt: contractAttachment.updatedAt ?? undefined,
		}
	}
}
