import { Prisma, Address as PrismaAddress } from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '@/domain/management/enterprise/entities/address'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaAddressMapper {
	static toDomain(raw: PrismaAddress): Address {
		return Address.create(
			{
				zipCode: raw.zipCode,
				street: raw.street,
				number: raw.number,
				complement: raw.complement ?? undefined,
				neighborhood: raw.neighborhood,
				city: raw.city,
				state: raw.state,
				country: raw.country,
				createdAt: new Date(raw.createdAt),
				updatedAt: raw.updatedAt ?? undefined,
			},
			new UniqueEntityId(raw.id),
		)
	}

	static toPrisma(address: Address): Prisma.AddressUncheckedCreateInput {
		return {
			id: address.id.toString(),
			zipCode: address.zipCode,
			street: address.street,
			number: address.number,
			complement: address.complement,
			neighborhood: address.neighborhood,
			city: address.city,
			state: address.state,
			country: address.country,
			createdAt: address.createdAt,
			updatedAt: address.updatedAt,
		}
	}
}
