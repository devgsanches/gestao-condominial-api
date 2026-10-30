import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { MaintenanceDetails } from '../../enterprise/entities/value-objects/maintenance-details'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'

interface GetMaintenanceInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	maintenanceId: UniqueEntityId
}

type GetMaintenanceOutput = Either<
	NotFoundException | UnauthorizedException,
	{ details: MaintenanceDetails }
>

@Injectable()
export class GetMaintenanceUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private maintenancesRepository: MaintenancesRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		maintenanceId,
	}: GetMaintenanceInput): Promise<GetMaintenanceOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException('Condominium not found.'))
		}

		if (!condominium.managerId.equals(managerId)) {
			return left(new UnauthorizedException())
		}

		const details =
			await this.maintenancesRepository.findDetailsById(maintenanceId)

		if (!details?.maintenance.condominiumId.equals(condominiumId)) {
			return left(new NotFoundException('Maintenance not found.'))
		}

		return right({ details })
	}
}
