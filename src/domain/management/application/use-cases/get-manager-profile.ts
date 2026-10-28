import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ManagerWithCondominiums } from '../../enterprise/entities/value-objects/manager-with-condominiums'
import { ManagersRepository } from '../repositories/managers-repository'
import { ManagerNotFoundError } from './errors/manager-not-found'

interface GetManagerProfileInput {
	managerId: UniqueEntityId
}

type GetManagerProfileOutput = Either<
	ManagerNotFoundError,
	ManagerWithCondominiums
>

@Injectable()
export class GetManagerProfileUseCase {
	constructor(private managerRepository: ManagersRepository) {}

	async execute({
		managerId,
	}: GetManagerProfileInput): Promise<GetManagerProfileOutput> {
		const managerWithCondominiums =
			await this.managerRepository.findManagerWithCondominiums(managerId)

		if (!managerWithCondominiums) {
			return left(new ManagerNotFoundError())
		}

		return right(managerWithCondominiums)
	}
}
