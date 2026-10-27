import {
	Prisma,
	ContractAttachment as PrismaContractAttachment,
} from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ContractAttachment } from '@/domain/management/enterprise/entities/contract-attachment'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaContractAttachmentMapper {
	static toDomain(raw: PrismaContractAttachment): ContractAttachment {
		return ContractAttachment.create(
			{
				contractId: new UniqueEntityId(raw.contractId),
				attachmentId: new UniqueEntityId(raw.attachmentId),
				createdAt: new Date(raw.createdAt),
				updatedAt: raw.updatedAt,
			},
			new UniqueEntityId(raw.id),
		)
	}

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
