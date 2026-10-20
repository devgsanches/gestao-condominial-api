import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IAddressesRepository } from '@/domain/management/application/repositories/addresses-repository'
import { Address } from '@/domain/management/enterprise/entities/address'
import { PrismaAddressMapper } from '../mappers/prisma-address-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAddressesRepository implements IAddressesRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(address: Address): Promise<void> {
		const addressPrisma = PrismaAddressMapper.toPrisma(address)

		await this.prisma.address.create({
			data: {
				...addressPrisma,
			},
		})
	}

	async findById(id: UniqueEntityId): Promise<Address | null> {
		const address = await this.prisma.address.findUnique({
			where: {
				id: id.toValue(),
			},
		})

		if (!address) {
			return null
		}

		return PrismaAddressMapper.toDomain(address)
	}

	async delete(id: UniqueEntityId): Promise<void> {
		await this.prisma.address.delete({
			where: {
				id: id.toValue(),
			},
		})
	}
}
