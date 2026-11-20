import { Injectable, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CondominiumDashboard } from '../../enterprise/entities/value-objects/condominium-dashboard'
import { AdminsRepository } from '../repositories/admins-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { CondominiumInformationNotFoundError } from './errors/condominium-information-not-found-error'

interface FetchCondominiumDashboardInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type FetchCondominiumDashboardOutput = Either<
	CondominiumInformationNotFoundError | UnauthorizedException,
	{
		dashboard: CondominiumDashboard
	}
>

@Injectable()
export class FetchCondominiumDashboardUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private adminsRepository: AdminsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
	}: FetchCondominiumDashboardInput): Promise<FetchCondominiumDashboardOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(
				new CondominiumInformationNotFoundError(condominiumId.toString()),
			)
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

		const dashboard =
			await this.condominiumRepository.findDashboardbyCondominiumId(
				condominiumId,
			)

		if (!dashboard) {
			return left(
				new CondominiumInformationNotFoundError(condominiumId.toString()),
			)
		}

		return right({ dashboard })
	}
}
