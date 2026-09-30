import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'

interface GetCondominiumInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type GetCondominiumOutput = Either<
	NotFoundException | UnauthorizedException,
	{
		condominium: Condominium
	}
>

export class GetCondominiumUseCase {
	constructor(private condominiumRepository: ICondominiumsRepository) {}

	// managerId virá a partir da autenticação do síndico - rota estará protegida
	async execute({
		managerId,
		condominiumId,
	}: GetCondominiumInput): Promise<GetCondominiumOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		const isCondominiumManager = condominium?.managerId.equals(managerId)

		// somente o síndico do condomínio pode acessar o condomínio
		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		if (!condominium) {
			return left(new NotFoundException())
		}

		return right({ condominium })
	}
}
