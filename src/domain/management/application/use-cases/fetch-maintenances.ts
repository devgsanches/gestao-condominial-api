import { MaintenanceType } from '@generated/prisma/enums'
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { MaintenanceWithContract } from '../../enterprise/entities/value-objects/maintenance-with-contract'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'

interface FetchMaintenancesInput {
	type?: MaintenanceType
	title?: string
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type FetchMaintenancesOutput = Either<
	UnauthorizedException | NotFoundException,
	{ maintenances: MaintenanceWithContract[] }
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
			await this.maintenancesRepository.findManyWithContractByCondominiumId({
				condominiumId,
				filters: {
					title,
					type,
				},
			})

		return right({ maintenances })
	}
}
