import { MaintenanceType, Prisma } from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CondominiumWithAddress } from '@/domain/management/enterprise/entities/value-objects/condominium-with-address'
import { PrismaCondominiumMapper } from './prisma-condominium-mapper'

export const condominiumWithAddressInclude = {
	address: true,
	_count: {
		select: {
			maintenances: {
				where: {
					type: MaintenanceType.PERIODIC,
					canceledAt: null,
					contract: { is: null },
				},
			},
		},
	},
} satisfies Prisma.CondominiumInclude

type PrismaCondominiumWithAddress = Prisma.CondominiumGetPayload<{
	include: typeof condominiumWithAddressInclude
}>

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaCondominiumWithAddressMapper {
	static toDomain(raw: PrismaCondominiumWithAddress): CondominiumWithAddress {
		return CondominiumWithAddress.create({
			condominium: PrismaCondominiumMapper.toDomain(raw),
			address: {
				id: new UniqueEntityId(raw.address.id),
				city: raw.address.city,
			},
			periodicWithoutContractCount: raw._count.maintenances,
		})
	}
}
