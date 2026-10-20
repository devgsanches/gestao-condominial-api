import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IContractsRepository } from '@/domain/management/application/repositories/contracts-repository'
import { Contract } from '@/domain/management/enterprise/entities/contract'
import { PrismaContractMapper } from '../mappers/prisma-contract-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaContractsRepository implements IContractsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(contract: Contract): Promise<void> {
		const contractPrisma = PrismaContractMapper.toPrisma(contract)

		await this.prisma.contract.create({
			data: {
				...contractPrisma,
			},
		})
	}

	async save(contract: Contract): Promise<void> {
		const contractPrisma = PrismaContractMapper.toPrisma(contract)

		await this.prisma.contract.update({
			where: {
				id: contract.id.toValue(),
			},
			data: {
				...contractPrisma,
			},
		})
	}

	async findById(id: UniqueEntityId): Promise<Contract | null> {
		const contract = await this.prisma.contract.findUnique({
			where: {
				id: id.toValue(),
			},
		})

		if (!contract) {
			return null
		}

		return PrismaContractMapper.toDomain(contract)
	}

	async findByMaintenanceId(
		maintenanceId: UniqueEntityId,
	): Promise<Contract | null> {
		const contract = await this.prisma.contract.findUnique({
			where: {
				maintenanceId: maintenanceId.toValue(),
			},
		})

		if (!contract) {
			return null
		}

		return PrismaContractMapper.toDomain(contract)
	}

	async delete(id: UniqueEntityId): Promise<void> {
		await this.prisma.contract.delete({
			where: {
				id: id.toValue(),
			},
		})
	}
}
