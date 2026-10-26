import { Prisma } from '@generated/prisma/client'
import { Attachment } from '@/domain/management/enterprise/entities/attachment'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaAttachmentMapper {
	static toPrisma(
		attachment: Attachment,
	): Prisma.AttachmentUncheckedCreateInput {
		return {
			id: attachment.id.toString(),
			title: attachment.title,
			url: attachment.url,
			createdAt: attachment.createdAt,
			updatedAt: attachment.updatedAt ?? undefined,
		}
	}
}
