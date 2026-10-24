import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Manager,
	ManagerProps,
} from '@/domain/management/enterprise/entities/manager'
import { PrismaManagerMapper } from '@/infra/database/prisma/mappers/prisma-manager-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

export function makeManager(
	override: Partial<ManagerProps> = {},
	id?: UniqueEntityId,
) {
	const manager = Manager.create(
		{
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
			...override,
		},
		id,
	)

	return manager
}

@Injectable()
export class ManagerFactory {
	constructor(private prisma: PrismaService) {}

	async makePrismaManager(data: Partial<ManagerProps> = {}): Promise<Manager> {
		const manager = makeManager(data)

		await this.prisma.user.create({
			data: PrismaManagerMapper.toPrisma(manager),
		})

		return manager
	}
}
