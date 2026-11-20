import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
	Admin,
	AdminProps,
} from '@/domain/management/enterprise/entities/admin'
import { PrismaAdminMapper } from '@/infra/database/prisma/mappers/prisma-admin-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

export function makeAdmin(
	override: Partial<AdminProps> = {},
	id?: UniqueEntityId,
) {
	const admin = Admin.create(
		{
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
			...override,
		},
		id,
	)

	return admin
}

@Injectable()
export class AdminFactory {
	constructor(private prisma: PrismaService) {}

	async makePrismaAdmin(data: Partial<AdminProps> = {}): Promise<Admin> {
		const admin = makeAdmin(data)

		await this.prisma.user.create({
			data: PrismaAdminMapper.toPrisma(admin),
		})

		return admin
	}
}
