import { MaintenanceType } from '@generated/prisma/enums'
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { MaintenanceWithContract } from '../../enterprise/entities/value-objects/maintenance-with-contract'
import { AdminsRepository } from '../repositories/admins-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'

export const MAINTENANCES_PER_PAGE = 20

interface FetchMaintenancesInput {
	type?: MaintenanceType
	title?: string
	withoutContract?: boolean
	page?: number
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type FetchMaintenancesOutput = Either<
	UnauthorizedException | NotFoundException,
	{
		maintenances: MaintenanceWithContract[]
		page: number
		perPage: number
		total: number
	}
>

@Injectable()
export class FetchMaintenancesUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private maintenancesRepository: MaintenancesRepository,
		private adminsRepository: AdminsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		type,
		title,
		withoutContract = false,
		page = 1,
	}: FetchMaintenancesInput): Promise<FetchMaintenancesOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException('Condominium not found.'))
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

		const { maintenances, total } =
			await this.maintenancesRepository.findManyWithContractByCondominiumId({
				condominiumId,
				filters: {
					title,
					type,
					withoutContract,
				},
				pagination: {
					page,
					perPage: MAINTENANCES_PER_PAGE,
				},
			})

		return right({
			maintenances,
			page,
			perPage: MAINTENANCES_PER_PAGE,
			total,
		})
	}
}
