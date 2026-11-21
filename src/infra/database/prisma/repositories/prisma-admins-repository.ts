import { UserRole } from '@generated/prisma/enums'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AdminsRepository } from '@/domain/management/application/repositories/admins-repository'
import { Admin } from '@/domain/management/enterprise/entities/admin'
import { PrismaAdminMapper } from '../mappers/prisma-admin-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAdminsRepository implements AdminsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(admin: Admin): Promise<void> {
		const adminPrisma = PrismaAdminMapper.toPrisma(admin)

		await this.prisma.user.create({
			data: {
				...adminPrisma,
			},
		})
	}

	async save(admin: Admin): Promise<void> {
		const adminPrisma = PrismaAdminMapper.toPrisma(admin)

		await this.prisma.user.update({
			where: { id: admin.id.toString() },
			data: { ...adminPrisma },
		})
	}

	async findById(id: UniqueEntityId): Promise<Admin | null> {
		const admin = await this.prisma.user.findUnique({
			where: {
				id: id.toString(),
				AND: {
					role: UserRole.CONDOMINIUM_ADMIN,
				},
			},
		})

		if (!admin) {
			return null
		}

		return PrismaAdminMapper.toDomain(admin)
	}

	async findByEmail(email: string): Promise<Admin | null> {
		const admin = await this.prisma.user.findUnique({
			where: {
				email,
				AND: {
					role: UserRole.CONDOMINIUM_ADMIN,
				},
			},
		})

		if (!admin) {
			return null
		}

		return PrismaAdminMapper.toDomain(admin)
	}

	async findMany(): Promise<Admin[]> {
		const admins = await this.prisma.user.findMany({
			where: {
				role: UserRole.CONDOMINIUM_ADMIN,
			},
		})

		return admins.map((admin) => PrismaAdminMapper.toDomain(admin))
	}

	async isAdminOfCondominium(
		adminId: UniqueEntityId,
		condominiumId: UniqueEntityId,
	): Promise<boolean> {
		const link = await this.prisma.condominiumAdmin.findUnique({
			where: {
				condominiumId_adminId: {
					condominiumId: condominiumId.toString(),
					adminId: adminId.toString(),
				},
			},
		})

		return !!link
	}

	async linkToCondominium(
		adminId: UniqueEntityId,
		condominiumId: UniqueEntityId,
	): Promise<void> {
		await this.prisma.condominiumAdmin.create({
			data: {
				adminId: adminId.toString(),
				condominiumId: condominiumId.toString(),
			},
		})
	}
}
