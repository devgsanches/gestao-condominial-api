import { NotFoundException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'
import { IManagersRepository } from '../repositories/managers-repository'

interface GetManagerProfileInput {
	managerId: UniqueEntityId
}

interface ManagerProfile {
	name: string
	email: string
	condominiums: Condominium[]
}

type GetManagerProfileOutput = Either<
	NotFoundException,
	{
		manager: ManagerProfile
	}
>

export class GetManagerProfileUseCase {
	constructor(
		private managerRepository: IManagersRepository,
		private condominiumRepository: ICondominiumsRepository,
	) {}

	async execute({
		managerId,
	}: GetManagerProfileInput): Promise<GetManagerProfileOutput> {
		const manager = await this.managerRepository.findById(managerId)

		if (!manager) {
			return left(new NotFoundException('Manager not found'))
		}

		const condominiums =
			await this.condominiumRepository.findManyByManagerId(managerId)

		return right({
			manager: {
				name: manager.name,
				email: manager.email,
				condominiums: condominiums,
			},
		})
	}
}
