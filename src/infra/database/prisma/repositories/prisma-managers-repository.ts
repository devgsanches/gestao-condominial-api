import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import { Manager } from '@/domain/management/enterprise/entities/manager'
import { PrismaManagerMapper } from '../mappers/prisma-manager-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaManagersRepository implements IManagersRepository {
	constructor(private readonly prisma: PrismaService) {}

	create(manager: Manager): Promise<void> {
		throw new Error('Method not implemented.')
	}

	async findById(id: UniqueEntityId): Promise<Manager | null> {
		const manager = await this.prisma.user.findUnique({
			where: {
				id: id.toString(),
			},
		})

		if (!manager) {
			return null
		}

		return PrismaManagerMapper.toDomain(manager)
	}

	findByEmail(email: string): Promise<Manager | null> {
		throw new Error('Method not implemented.')
	}
}
