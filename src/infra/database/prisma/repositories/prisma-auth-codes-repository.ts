import { Injectable } from '@nestjs/common'
import { AuthCodesRepository } from '@/domain/management/application/repositories/auth-codes-repository'
import { AuthCode } from '@/domain/management/enterprise/entities/auth-code'
import { PrismaAuthCodeMapper } from '../mappers/prisma-auth-code-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAuthCodesRepository implements AuthCodesRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(authCode: AuthCode): Promise<void> {
		await this.prisma.authCode.create({
			data: PrismaAuthCodeMapper.toPrisma(authCode),
		})
	}

	async save(authCode: AuthCode): Promise<void> {
		await this.prisma.authCode.update({
			where: { id: authCode.id.toString() },
			data: PrismaAuthCodeMapper.toPrisma(authCode),
		})
	}

	async findLatestActiveByEmail(email: string): Promise<AuthCode | null> {
		const authCode = await this.prisma.authCode.findFirst({
			where: {
				email,
				usedAt: null,
			},
			orderBy: { createdAt: 'desc' },
		})

		if (!authCode) {
			return null
		}

		return PrismaAuthCodeMapper.toDomain(authCode)
	}
}
