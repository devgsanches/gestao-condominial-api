import { Injectable, NotFoundException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CondominiumWithAddress } from '../../enterprise/entities/value-objects/condominium-with-address'
import { CondominiumsRepository } from '../repositories/condominiums-repository'

interface FetchCondominiumsByManagerInput {
	managerId: UniqueEntityId
}

type FetchCondominiumsByManagerOutput = Either<
	NotFoundException,
	{
		condominiums: CondominiumWithAddress[]
	}
>

@Injectable()
export class FetchCondominiumsByManagerUseCase {
	constructor(private condominiumRepository: CondominiumsRepository) {}

	// managerId virá a partir da autenticação do síndico - rota estará protegida
	async execute({
		managerId,
	}: FetchCondominiumsByManagerInput): Promise<FetchCondominiumsByManagerOutput> {
		const [managed, administered] = await Promise.all([
			this.condominiumRepository.findManyWithAddressByManagerId(managerId),
			this.condominiumRepository.findManyWithAddressByAdminId(managerId),
		])

		if (!managed || !administered) {
			return left(new NotFoundException())
		}

		return right({ condominiums: [...managed, ...administered] })
	}
}
