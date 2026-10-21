import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { Slug } from '../../enterprise/entities/value-objects/slug'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ManagersRepository } from '../repositories/managers-repository'
import { CondominiumAlreadyExistsError } from './errors/condominium-already-exists-error'
import { MaxCondominiumsReachedError } from './errors/max-condominiums-reached-error'
import { NotAManagerError } from './errors/not-a-manager-error'

interface CreateCondominiumInput {
	managerId: UniqueEntityId
	addressId: UniqueEntityId
	name: string
}

type CreateCondominiumOutput = Either<
	NotAManagerError | CondominiumAlreadyExistsError | MaxCondominiumsReachedError,
	{
		condominium: Condominium
	}
>

@Injectable()
export class CreateCondominiumUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private managersRepository: ManagersRepository,
	) {}

	async execute({
		managerId,
		addressId,
		name,
	}: CreateCondominiumInput): Promise<CreateCondominiumOutput> {
		const manager = await this.managersRepository.findById(managerId)

		if (!manager) {
			return left(new NotAManagerError())
		}

		const condominiumAlreadyExists =
			await this.condominiumRepository.findByName(name)

		if (condominiumAlreadyExists) {
			return left(new CondominiumAlreadyExistsError(name))
		}

		const condominiums =
			await this.condominiumRepository.findManyByManagerId(managerId)

		if (condominiums.length >= 50) {
			return left(new MaxCondominiumsReachedError())
		}

		const condominium = Condominium.create({
			managerId,
			addressId,
			name,
			slug: Slug.createFromText(name),
		})

		await this.condominiumRepository.create(condominium)

		return right({ condominium })
	}
}
