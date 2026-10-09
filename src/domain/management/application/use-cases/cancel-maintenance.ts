import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'
import { IContractsRepository } from '../repositories/contracts-repository'
import { IMaintenancesRepository } from '../repositories/maintenances-repository'

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

export class CancelMaintenanceUseCase {
	constructor(
		private condominiumRepository: ICondominiumsRepository,
		private maintenanceRepository: IMaintenancesRepository,
		private contractRepository: IContractsRepository,
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

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const maintenance = await this.maintenanceRepository.findById(maintenanceId)

		if (!maintenance) {
			return left(new NotFoundException())
		}

		maintenance.canceledAt = new Date()

    await this.maintenanceRepository.save(maintenance)

		const isPeriodicMaintenance = maintenance.type === 'periodic'

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
