import { NotFoundException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { CondominiumsRepository } from '../repositories/condominiums-repository'

interface FetchCondominiumsByManagerInput {
	managerId: UniqueEntityId
}

type FetchCondominiumsByManagerOutput = Either<
	NotFoundException,
	{
		condominiums: Condominium[]
	}
>

export class FetchCondominiumsByManagerUseCase {
	constructor(private condominiumRepository: CondominiumsRepository) {}

	// managerId virá a partir da autenticação do síndico - rota estará protegida
	async execute({
		managerId,
	}: FetchCondominiumsByManagerInput): Promise<FetchCondominiumsByManagerOutput> {
		const condominiums =
			await this.condominiumRepository.findManyByManagerId(managerId)

		if (!condominiums) {
			return left(new NotFoundException())
		}

		return right({ condominiums })
	}
}
