import { UserRole } from '@generated/prisma/enums'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import { Manager } from '@/domain/management/enterprise/entities/manager'
import { ManagerWithCondominiums } from '@/domain/management/enterprise/entities/value-objects/manager-with-condominiums'
import { PrismaManagerMapper } from '../mappers/prisma-manager-mapper'
import { PrismaManagerWithCondominiumsMapper } from '../mappers/prisma-manager-with-condominiums-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaManagersRepository implements ManagersRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(manager: Manager): Promise<void> {
		const managerPrisma = PrismaManagerMapper.toPrisma(manager)

		await this.prisma.user.create({
			data: {
				...managerPrisma,
			},
		})
	}

	async save(manager: Manager): Promise<void> {
		const managerPrisma = PrismaManagerMapper.toPrisma(manager)

		await this.prisma.user.update({
			where: { id: manager.id.toString() },
			data: { ...managerPrisma },
		})
	}

	async findById(id: UniqueEntityId): Promise<Manager | null> {
		const manager = await this.prisma.user.findUnique({
			where: {
				id: id.toString(),
				AND: {
					role: UserRole.CONDOMINIUM_MANAGER,
				},
			},
		})

		if (!manager) {
			return null
		}

		return PrismaManagerMapper.toDomain(manager)
	}

	async findManagerWithCondominiums(
		id: UniqueEntityId,
	): Promise<ManagerWithCondominiums | null> {
		const manager = await this.prisma.user.findUnique({
			where: {
				id: id.toString(),
				AND: {
					role: UserRole.CONDOMINIUM_MANAGER,
				},
			},
			include: {
				condominiums: {
					include: {
						address: true,
					},
				},
			},
		})

		if (!manager) {
			return null
		}

		return PrismaManagerWithCondominiumsMapper.toDomain(manager)
	}

	async findByEmail(email: string): Promise<Manager | null> {
		const manager = await this.prisma.user.findUnique({
			where: {
				email,
			},
		})

		if (!manager) {
			return null
		}

		return PrismaManagerMapper.toDomain(manager)
	}
}
