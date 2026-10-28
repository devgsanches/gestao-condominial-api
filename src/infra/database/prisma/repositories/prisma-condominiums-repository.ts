import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import { Condominium } from '@/domain/management/enterprise/entities/condominium'
import { PrismaCondominiumMapper } from '../mappers/prisma-condominium-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCondominiumsRepository implements CondominiumsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(condominium: Condominium): Promise<void> {
		const condominiumPrisma = PrismaCondominiumMapper.toPrisma(condominium)

		await this.prisma.condominium.create({
			data: {
				...condominiumPrisma,
			},
		})
	}

	async findByName(name: string): Promise<Condominium | null> {
		const condominium = await this.prisma.condominium.findFirst({
			where: {
				name,
			},
		})

		if (!condominium) {
			return null
		}

		return PrismaCondominiumMapper.toDomain(condominium)
	}

	async findById(id: UniqueEntityId): Promise<Condominium | null> {
		const condominium = await this.prisma.condominium.findUnique({
			where: {
				id: id.toValue(),
			},
		})

		if (!condominium) {
			return null
		}

		return PrismaCondominiumMapper.toDomain(condominium)
	}

	async findManyByManagerId(managerId: UniqueEntityId): Promise<Condominium[]> {
		const condominiums = await this.prisma.condominium.findMany({
			where: {
				managerId: managerId.toValue(),
			},
		})

		const condominiumsToDomain = condominiums.map((c) =>
			PrismaCondominiumMapper.toDomain(c),
		)

		return condominiumsToDomain
	}

	async findByManagerId(
		managerId: UniqueEntityId,
	): Promise<Condominium | null> {
		const condominium = await this.prisma.condominium.findFirst({
			where: {
				managerId: managerId.toValue(),
			},
		})

		if (!condominium) {
			return null
		}

		return PrismaCondominiumMapper.toDomain(condominium)
	}

	async findByAddressId(
		addressId: UniqueEntityId,
	): Promise<Condominium | null> {
		const condominium = await this.prisma.condominium.findUnique({
			where: {
				addressId: addressId.toValue(),
			},
		})

		if (!condominium) {
			return null
		}

		return PrismaCondominiumMapper.toDomain(condominium)
	}

	async update(
		condominium: Pick<Condominium, 'name' | 'id'>,
	): Promise<Condominium> {
		const updatedCondominium = await this.prisma.condominium.update({
			where: {
				id: condominium.id.toValue(),
			},
			data: {
				name: condominium.name,
			},
		})

		return PrismaCondominiumMapper.toDomain(updatedCondominium)
	}

	async delete(id: UniqueEntityId): Promise<void> {
		await this.prisma.condominium.delete({
			where: {
				id: id.toValue(),
			},
		})
	}
}
