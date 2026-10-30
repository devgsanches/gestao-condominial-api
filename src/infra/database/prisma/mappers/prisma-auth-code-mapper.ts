import { Prisma, AuthCode as PrismaAuthCode } from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AuthCode } from '@/domain/management/enterprise/entities/auth-code'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaAuthCodeMapper {
	static toDomain(raw: PrismaAuthCode): AuthCode {
		return AuthCode.create(
			{
				email: raw.email,
				code: raw.code,
				attempts: raw.attempts,
				expiresAt: new Date(raw.expiresAt),
				usedAt: raw.usedAt,
				createdAt: new Date(raw.createdAt),
			},
			new UniqueEntityId(raw.id),
		)
	}

	static toPrisma(authCode: AuthCode): Prisma.AuthCodeUncheckedCreateInput {
		return {
			id: authCode.id.toString(),
			email: authCode.email,
			code: authCode.code,
			attempts: authCode.attempts,
			expiresAt: authCode.expiresAt,
			usedAt: authCode.usedAt,
			createdAt: authCode.createdAt,
		}
	}
}
