import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { HashGenerator } from '../cryptography/hash-generator'
import { ManagersRepository } from '../repositories/managers-repository'
import { ManagerNotFoundError } from './errors/manager-not-found'

interface SetManagerPasswordInput {
	managerId: UniqueEntityId
	password: string
}

type SetManagerPasswordOutput = Either<ManagerNotFoundError, null>

@Injectable()
export class SetManagerPasswordUseCase {
	constructor(
		private managersRepository: ManagersRepository,
		private hashGenerator: HashGenerator,
	) {}

	async execute({
		managerId,
		password,
	}: SetManagerPasswordInput): Promise<SetManagerPasswordOutput> {
		const manager = await this.managersRepository.findById(managerId)

		if (!manager) {
			return left(new ManagerNotFoundError())
		}

		manager.password = await this.hashGenerator.hash(password)

		await this.managersRepository.save(manager)

		return right(null)
	}
}
