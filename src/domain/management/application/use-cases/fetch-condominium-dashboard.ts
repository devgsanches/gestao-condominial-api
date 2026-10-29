import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CondominiumDashboard } from '../../enterprise/entities/value-objects/condominium-dashboard'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { CondominiumInformationNotFoundError } from './errors/condominium-information-not-found-error'

interface FetchCondominiumDashboardInput {
	condominiumId: UniqueEntityId
}

type FetchCondominiumDashboardOutput = Either<
	CondominiumInformationNotFoundError,
	{
		dashboard: CondominiumDashboard
	}
>

@Injectable()
export class FetchCondominiumDashboardUseCase {
	constructor(private condominiumRepository: CondominiumsRepository) {}

	async execute({
		condominiumId,
	}: FetchCondominiumDashboardInput): Promise<FetchCondominiumDashboardOutput> {
		const dashboard =
			await this.condominiumRepository.findDashboardbyCondominiumId(condominiumId)

		if (!dashboard) {
			return left(
				new CondominiumInformationNotFoundError(condominiumId.toString()),
			)
		}

		return right({ dashboard })
	}
}
