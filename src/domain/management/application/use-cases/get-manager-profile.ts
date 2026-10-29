import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Manager } from '../../enterprise/entities/manager'
import { ManagersRepository } from '../repositories/managers-repository'
import { ManagerNotFoundError } from './errors/manager-not-found'

interface GetManagerProfileInput {
	managerId: UniqueEntityId
}

type GetManagerProfileOutput = Either<ManagerNotFoundError, Manager>

@Injectable()
export class GetManagerProfileUseCase {
	constructor(private managerRepository: ManagersRepository) {}

	async execute({
		managerId,
	}: GetManagerProfileInput): Promise<GetManagerProfileOutput> {
		const manager = await this.managerRepository.findById(managerId)

		if (!manager) {
			return left(new ManagerNotFoundError())
		}

		return right(manager)
	}
}
