import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'

export enum MaintenanceType {
	GENERAL = 'general',
	PERIODIC = 'periodic',
}

interface FetchMaintenancesInput {
	type?: MaintenanceType
	title?: string
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type FetchMaintenancesOutput = Either<
	UnauthorizedException | NotFoundException,
	{ maintenances: Maintenance[] }
>

@Injectable()
export class FetchMaintenancesUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private maintenancesRepository: MaintenancesRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		type,
		title,
	}: FetchMaintenancesInput): Promise<FetchMaintenancesOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException('Condominium not found.'))
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const maintenances =
			await this.maintenancesRepository.findManyByCondominiumId({
				condominiumId,
				filters: {
					title,
					type,
				},
			})

		return right({ maintenances })
	}
}
