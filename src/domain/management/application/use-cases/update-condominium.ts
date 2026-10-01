import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'

interface UpdateCondominiumInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	name: string
}

type UpdateCondominiumOutput = Either<
	UnauthorizedException | NotFoundException,
	{
		condominium: Condominium
	}
>

export class UpdateCondominiumUseCase {
	constructor(private condominiumRepository: ICondominiumsRepository) {}

	// managerId virá a partir da autenticação do síndico - rota estará protegida
	async execute({
		managerId,
		condominiumId,
		name,
	}: UpdateCondominiumInput): Promise<UpdateCondominiumOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		const isCondominiumManager = condominium?.managerId.equals(managerId)

		// somente o síndico do condomínio pode atualizar o condomínio
		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		if (!condominium) {
			return left(new NotFoundException())
		}

		const condominiumUpdated = await this.condominiumRepository.update({
			id: condominiumId,
			name,
		})

		return right({ condominium: condominiumUpdated })
	}
}
