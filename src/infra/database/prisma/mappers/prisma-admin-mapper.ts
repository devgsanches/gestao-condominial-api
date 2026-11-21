import { Prisma, User as PrismaUser } from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Admin } from '@/domain/management/enterprise/entities/admin'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaAdminMapper {
	static toDomain(raw: PrismaUser): Admin {
		return Admin.create(
			{
				name: raw.name,
				email: raw.email,
				password: raw.password,
				role: raw.role,
				avatarUrl: raw.avatarUrl,
				createdAt: new Date(raw.createdAt),
				updatedAt: raw.updatedAt,
			},
			new UniqueEntityId(raw.id),
		)
	}

	static toPrisma(admin: Admin): Prisma.UserUncheckedCreateInput {
		return {
			id: admin.id.toString(),
			name: admin.name,
			email: admin.email,
			password: admin.password,
			role: admin.role,
			avatarUrl: admin.avatarUrl,
			createdAt: admin.createdAt,
			updatedAt: admin.updatedAt ?? undefined,
		}
	}
}
