import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ContractAttachmentsRepository } from '@/domain/management/application/repositories/contract-attachments-repository'
import { ContractsRepository } from '@/domain/management/application/repositories/contracts-repository'
import { Contract } from '@/domain/management/enterprise/entities/contract'
import { PrismaContractMapper } from '../mappers/prisma-contract-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaContractsRepository implements ContractsRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly contractAttachmentsRepository: ContractAttachmentsRepository,
	) {}

	async create(contract: Contract): Promise<void> {
		const contractPrisma = PrismaContractMapper.toPrisma(contract)

		await this.prisma.contract.create({
			data: {
				...contractPrisma,
			},
		})
	}

	async save(contract: Contract): Promise<void> {
		const data = PrismaContractMapper.toPrisma(contract)

		await this.prisma.contract.update({
			where: { id: contract.id.toValue() },
			data,
		})

		await this.contractAttachmentsRepository.createMany(
			contract.attachments.getNewItems(),
		)

		await this.contractAttachmentsRepository.deleteMany(
			contract.attachments.getRemovedItems(),
		)
	}

	async findById(id: UniqueEntityId): Promise<Contract | null> {
		const contract = await this.prisma.contract.findUnique({
			where: {
				id: id.toValue(),
			},
			include: {
				attachments: true,
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
			include: {
				attachments: true,
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
