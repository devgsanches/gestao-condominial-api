import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'

interface RegisterCondominiumInput {
	managerId: UniqueEntityId
	addressId: UniqueEntityId
	name: string
}

type RegisterCondominiumOutput = Either<
	Error,
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
		const condominiums =
			await this.condominiumRepository.findManyByManagerId(managerId)

		if (condominiums.length >= 50) {
			return left(new Error('Maximum number of condominiums reached'))
		}

		const condominium = Condominium.create({
			managerId,
			addressId,
			name,
		})

		await this.condominiumRepository.create(condominium)

		return right({ condominium })
	}
}
