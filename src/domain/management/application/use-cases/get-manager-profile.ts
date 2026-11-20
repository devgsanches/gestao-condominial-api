import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Admin } from '../../enterprise/entities/admin'
import type { Manager } from '../../enterprise/entities/manager'
import { AdminsRepository } from '../repositories/admins-repository'
import { ManagersRepository } from '../repositories/managers-repository'
import { ManagerNotFoundError } from './errors/manager-not-found'

interface GetManagerProfileInput {
	managerId: UniqueEntityId
}

type GetManagerProfileOutput = Either<ManagerNotFoundError, Manager | Admin>

@Injectable()
export class GetManagerProfileUseCase {
	constructor(
		private managerRepository: ManagersRepository,
		private adminsRepository: AdminsRepository,
	) {}

	async execute({
		managerId,
	}: GetManagerProfileInput): Promise<GetManagerProfileOutput> {
		const manager = await this.managerRepository.findById(managerId)

		if (manager) {
			return right(manager)
		}

		const admin = await this.adminsRepository.findById(managerId)

		if (!admin) {
			return left(new ManagerNotFoundError())
		}

		return right(admin)
	}
}
