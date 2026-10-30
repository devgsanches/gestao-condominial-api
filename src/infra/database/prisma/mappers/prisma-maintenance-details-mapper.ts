import { Prisma } from '@generated/prisma/client'
import { MaintenanceDetails } from '@/domain/management/enterprise/entities/value-objects/maintenance-details'
import { PrismaAttachmentMapper } from './prisma-attachment-mapper'
import { PrismaContractMapper } from './prisma-contract-mapper'
import { PrismaMaintenanceMapper } from './prisma-maintenance-mapper'

export const maintenanceDetailsInclude = {
	contract: {
		include: {
			attachments: {
				include: { attachment: true },
				orderBy: { createdAt: 'asc' },
			},
		},
	},
} satisfies Prisma.MaintenanceInclude

type PrismaMaintenanceDetails = Prisma.MaintenanceGetPayload<{
	include: typeof maintenanceDetailsInclude
}>

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaMaintenanceDetailsMapper {
	static toDomain(raw: PrismaMaintenanceDetails): MaintenanceDetails {
		return MaintenanceDetails.create({
			maintenance: PrismaMaintenanceMapper.toDomain(raw),
			contract: raw.contract
				? PrismaContractMapper.toDomain(raw.contract)
				: null,
			attachments: raw.contract
				? raw.contract.attachments.map(({ attachment }) =>
						PrismaAttachmentMapper.toDomain(attachment),
					)
				: [],
		})
	}
}
