import { Prisma } from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CondominiumWithAddress } from '@/domain/management/enterprise/entities/value-objects/condominium-with-address'
import { PrismaCondominiumMapper } from './prisma-condominium-mapper'

type PrismaCondominiumWithAddress = Prisma.CondominiumGetPayload<{
	include: { address: true }
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
		})
	}
}
