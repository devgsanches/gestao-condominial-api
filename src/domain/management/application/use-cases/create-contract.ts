import { MaintenanceType } from '@generated/prisma/enums'
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Contract } from '../../enterprise/entities/contract'
import { ContractAttachmentList } from '../../enterprise/entities/contract-attachment-list'
import { AdminsRepository } from '../repositories/admins-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ContractsRepository } from '../repositories/contracts-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'

interface CreateContractInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	maintenanceId: UniqueEntityId
	title?: string | null
	description?: string | null
	supplierName: string
	supplierCnpj: string
	valueInCents: number
	startVigencyDate: Date
	endVigencyDate: Date
}

type CreateContractOutput = Either<
	| NotFoundException
	| UnauthorizedException
	| BadRequestException
	| ConflictException,
	{
		contract: Contract
	}
>

@Injectable()
export class CreateContractUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private maintenanceRepository: MaintenancesRepository,
		private contractRepository: ContractsRepository,
		private adminsRepository: AdminsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		maintenanceId,
		title,
		description,
		supplierName,
		supplierCnpj,
		valueInCents,
		startVigencyDate,
		endVigencyDate,
	}: CreateContractInput): Promise<CreateContractOutput> {
		if (endVigencyDate.getTime() <= startVigencyDate.getTime()) {
			return left(
				new BadRequestException(
					'Contract end vigency date must be after the start date.',
				),
			)
		}

		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		const isValidAdmin =
			!isCondominiumManager &&
			(await this.adminsRepository.isAdminOfCondominium(
				managerId,
				condominium.id,
			))

		if (!isCondominiumManager && !isValidAdmin) {
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

		const contractAlreadyExists =
			await this.contractRepository.findByMaintenanceId(maintenanceId)

		if (contractAlreadyExists) {
			return left(
				new ConflictException(
					'A contract already exists for this maintenance.',
				),
			)
		}

		const contract = Contract.create({
			maintenanceId,
			title,
			description,
			supplierName,
			supplierCnpj,
			valueInCents,
			isValid: true,
			attachments: new ContractAttachmentList([]),
			startVigencyDate,
			endVigencyDate,
		})

		await this.contractRepository.create(contract)

		return right({ contract })
	}
}
