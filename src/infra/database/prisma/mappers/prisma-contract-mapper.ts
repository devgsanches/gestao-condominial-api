import { Prisma } from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Contract } from '@/domain/management/enterprise/entities/contract'
import { ContractAttachmentList } from '@/domain/management/enterprise/entities/contract-attachment-list'
import { Slug } from '@/domain/management/enterprise/entities/value-objects/slug'
import { PrismaContractAttachmentMapper } from './contract-attachment-mapper'

type PrismaContractWithAttachments = Prisma.ContractGetPayload<{
	include: { attachments: true }
}>

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaContractMapper {
	static toDomain(raw: PrismaContractWithAttachments): Contract {
		const attachments = raw.attachments.map((attachment) =>
			PrismaContractAttachmentMapper.toDomain(attachment),
		)

		return Contract.create(
			{
				maintenanceId: new UniqueEntityId(raw.maintenanceId),
				title: raw.title,
				slug: new Slug(raw.slug),
				description: raw.description,
				isValid: raw.isValid,
				startVigencyDate: new Date(raw.startVigencyDate),
				endVigencyDate: new Date(raw.endVigencyDate),
				attachments: new ContractAttachmentList(attachments),
				createdAt: new Date(raw.createdAt),
				updatedAt: raw.updatedAt ?? undefined,
			},
			new UniqueEntityId(raw.id),
		)
	}

	static toPrisma(contract: Contract): Prisma.ContractUncheckedCreateInput {
		return {
			id: contract.id.toString(),
			maintenanceId: contract.maintenanceId.toString(),
			title: contract.title,
			slug: contract.slug.value,
			description: contract.description,
			isValid: contract.isValid,
			startVigencyDate: contract.startVigencyDate,
			endVigencyDate: contract.endVigencyDate,
			createdAt: contract.createdAt,
			updatedAt: contract.updatedAt,
		}
	}
}
