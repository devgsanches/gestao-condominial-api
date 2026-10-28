import {
	Address as PrismaAddress,
	Condominium as PrismaCondominium,
	User as PrismaUser,
} from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ManagerWithCondominiums } from '@/domain/management/enterprise/entities/value-objects/manager-with-condominiums'

type PrismaCondominiumWithAddress = PrismaCondominium & {
	address: PrismaAddress
}

type PrismaManagerWithCondominiums = PrismaUser & {
	condominiums: PrismaCondominiumWithAddress[]
}

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaManagerWithCondominiumsMapper {
	static toDomain(raw: PrismaManagerWithCondominiums): ManagerWithCondominiums {
		return ManagerWithCondominiums.create({
			managerId: new UniqueEntityId(raw.id),
			name: raw.name,
			email: raw.email,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			condominiums: raw.condominiums.map((condominium) => ({
				condominiumId: new UniqueEntityId(condominium.id),
				name: condominium.name,
				address: {
					id: new UniqueEntityId(condominium.address.id),
					city: condominium.address.city,
				},
				createdAt: condominium.createdAt,
				updatedAt: condominium.updatedAt,
			})),
		})
	}
}
