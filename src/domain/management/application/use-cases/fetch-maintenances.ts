import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IMaintenancesRepository } from '../repositories/maintenances-repository'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'
import { Maintenance } from '../../enterprise/entities/maintenance'

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
	| { maintenances: Maintenance[] }
>

export class FetchMaintenancesUseCase {
	constructor(
		private condominiumRepository: ICondominiumsRepository,
		private maintenancesRepository: IMaintenancesRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		type,
    title,
	}: FetchMaintenancesInput): Promise<FetchMaintenancesOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		const maintenances = await this.maintenancesRepository.findManyByCondominiumId({
      condominiumId,
      filters: {
        title,
        type,
      },
    })

		return right({ maintenances })
	}
}
