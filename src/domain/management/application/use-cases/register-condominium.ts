import { type Either, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'

interface RegisterCondominiumInput {
	managerId: UniqueEntityId
	addressId: UniqueEntityId
	name: string
}

type RegisterCondominiumOutput = Either<
	undefined,
	{
		condominium: Condominium
	}
>

export class RegisterCondominiumUseCase {
	constructor(private condominiumRepository: ICondominiumsRepository) {}

	async execute({
		managerId,
		addressId,
		name,
	}: RegisterCondominiumInput): Promise<RegisterCondominiumOutput> {
		const condominium = Condominium.create({
			managerId,
			addressId,
			name,
		})

		await this.condominiumRepository.create(condominium)

		return right({ condominium })
	}
}
