import {
	Prisma,
	Condominium as PrismaCondominium,
} from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '@/domain/management/enterprise/entities/condominium'
import { Slug } from '@/domain/management/enterprise/entities/value-objects/slug'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaCondominiumMapper {
	static toDomain(raw: PrismaCondominium): Condominium {
		return Condominium.create(
			{
				managerId: new UniqueEntityId(raw.managerId),
				addressId: new UniqueEntityId(raw.addressId),
				name: raw.name,
				slug: Slug.create(raw.slug),
				unitsCount: raw.unitsCount,
				createdAt: new Date(raw.createdAt),
				updatedAt: raw.updatedAt,
			},
			new UniqueEntityId(raw.id),
		)
	}

	static toPrisma(
		condominium: Condominium,
	): Prisma.CondominiumUncheckedCreateInput {
		return {
			id: condominium.id.toString(),
			managerId: condominium.managerId.toString(),
			addressId: condominium.addressId.toString(),
			name: condominium.name,
			slug: condominium.slug.value,
			unitsCount: condominium.unitsCount,
			createdAt: condominium.createdAt,
			updatedAt: condominium.updatedAt,
		}
	}
}
