import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'

interface UpdateMaintenanceInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	maintenanceId: UniqueEntityId
	title?: string
	description?: string
}

type UpdateMaintenanceOutput = Either<
	UnauthorizedException | NotFoundException,
	{
		maintenance: Maintenance
	}
>

export class UpdateMaintenanceUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private maintenanceRepository: MaintenancesRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		maintenanceId,
		title,
		description,
	}: UpdateMaintenanceInput): Promise<UpdateMaintenanceOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		const isCondominiumManager = condominium?.managerId.equals(managerId)

		// somente o síndico do condomínio pode atualizar aquela manutenção do condomínio
		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const maintenance = await this.maintenanceRepository.findById(maintenanceId)

		if (!maintenance) {
			return left(new NotFoundException())
		}

		// verifica se a manutenção pertence ao condomínio e é valida (canceledAt nulo)
		const isMaintenanceValid =
			maintenance?.condominiumId.equals(condominiumId) &&
			!maintenance.canceledAt

		if (!isMaintenanceValid) {
			return left(new NotFoundException('Maintenance not found or invalid'))
		}

		if (title) {
			maintenance.title = title
		}
		if (description) {
			maintenance.description = description
		}

		await this.maintenanceRepository.update(maintenance)

		return right({ maintenance })
	}
}
