import { Prisma, User as PrismaUser } from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Manager } from '@/domain/management/enterprise/entities/manager'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaManagerMapper {
	static toDomain(raw: PrismaUser): Manager {
		return Manager.create(
			{
				name: raw.name,
				email: raw.email,
				password: raw.password,
				createdAt: new Date(raw.createdAt),
				updatedAt: raw.updatedAt,
			},
			new UniqueEntityId(raw.id),
		)
	}

	static toPrisma(manager: Manager): Prisma.UserUncheckedCreateInput {
		return {
			id: manager.id.toString(),
			name: manager.name,
			email: manager.email,
			password: manager.password,
			role: manager.role,
			createdAt: manager.createdAt,
			updatedAt: manager.updatedAt ?? undefined,
		}
	}
}
