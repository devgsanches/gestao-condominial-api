import {
	BadRequestException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Contract } from '../../enterprise/entities/contract'
import { ContractAttachmentList } from '../../enterprise/entities/contract-attachment-list'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ContractsRepository } from '../repositories/contracts-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'
import { MaintenanceType } from './fetch-maintenances'

interface CreateContractInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	maintenanceId: UniqueEntityId
	title: string
	description: string
	startVigencyDate: Date
	endVigencyDate: Date
}

type CreateContractOutput = Either<
	NotFoundException | UnauthorizedException | BadRequestException,
	{
		contract: Contract
	}
>

export class CreateContractUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private maintenanceRepository: MaintenancesRepository,
		private contractRepository: ContractsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		maintenanceId,
		title,
		description,
		startVigencyDate,
		endVigencyDate,
	}: CreateContractInput): Promise<CreateContractOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const maintenance = await this.maintenanceRepository.findById(maintenanceId)

		if (!maintenance) {
			return left(new NotFoundException())
		}

		const isMaintenanceValid =
			maintenance.condominiumId.equals(condominiumId) &&
			!maintenance.canceledAt &&
			maintenance.type === MaintenanceType.PERIODIC

		if (!isMaintenanceValid) {
			return left(new BadRequestException('Maintenance is not valid'))
		}

		const contract = Contract.create({
			maintenanceId,
			title,
			description,
			isValid: true,
			attachments: new ContractAttachmentList([]),
			startVigencyDate,
			endVigencyDate,
		})

		await this.contractRepository.create(contract)

		return right({ contract })
	}
}
