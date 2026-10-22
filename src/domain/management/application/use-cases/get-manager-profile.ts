import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { CondominiumWithAddress } from '../interfaces/condominium'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ManagersRepository } from '../repositories/managers-repository'
import { ManagerNotFoundError } from './errors/manager-not-found'

interface GetManagerProfileInput {
	managerId: UniqueEntityId
}

export interface ManagerProfile {
	id: string
	name: string
	email: string
	condominiums: CondominiumWithAddress[]
}

type GetManagerProfileOutput = Either<
	ManagerNotFoundError,
	{
		manager: ManagerProfile
	}
>

@Injectable()
export class GetManagerProfileUseCase {
	constructor(
		private managerRepository: ManagersRepository,
		private condominiumRepository: CondominiumsRepository,
	) {}

	async execute({
		managerId,
	}: GetManagerProfileInput): Promise<GetManagerProfileOutput> {
		const manager = await this.managerRepository.findById(managerId)

		if (!manager) {
			return left(new ManagerNotFoundError())
		}

		const condominiumsWithAddress =
			await this.condominiumRepository.findManyWithAddressByManagerId(
				managerId,
			)

		return right({
			manager: {
				id: manager.id.toString(),
				name: manager.name,
				email: manager.email,
				condominiums: condominiumsWithAddress,
			},
		})
	}
}
