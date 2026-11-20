import { MaintenanceType } from '@generated/prisma/enums'
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { AdminsRepository } from '../repositories/admins-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ContractsRepository } from '../repositories/contracts-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'

interface CancelMaintenanceInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	maintenanceId: UniqueEntityId
}

type CancelMaintenanceOutput = Either<
	NotFoundException | UnauthorizedException,
	{
		maintenance: Maintenance
	}
>

@Injectable()
export class CancelMaintenanceUseCase {
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
	}: CancelMaintenanceInput): Promise<CancelMaintenanceOutput> {
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

		maintenance.canceledAt = new Date()

		await this.maintenanceRepository.save(maintenance)

		const isPeriodicMaintenance = maintenance.type === MaintenanceType.PERIODIC

		if (isPeriodicMaintenance) {
			const contract =
				await this.contractRepository.findByMaintenanceId(maintenanceId)

			if (contract) {
				contract.invalidate()
				await this.contractRepository.save(contract)
			}
		}

		return right({ maintenance })
	}
}
