import { ConflictException, Injectable } from '@nestjs/common'
import { hash } from 'bcryptjs'
import { type Either, left, right } from '@/core/either'
import { Manager } from '../../enterprise/entities/manager'
import { HashGenerator } from '../cryptography/hash-generator'
import { ManagersRepository } from '../repositories/managers-repository'
import { ManagerAlreadyExistsError } from './errors/manager-already-exists-error'

interface RegisterManagerInput {
	name: string
	email: string
	password: string
}

type RegisterManagerOutput = Either<
	ManagerAlreadyExistsError,
	{
		manager: Manager
	}
>

@Injectable()
export class RegisterManagerUseCase {
	constructor(
		private managersRepository: ManagersRepository,
		private hashGenerator: HashGenerator,
	) {}

	async execute({
		name,
		email,
		password,
	}: RegisterManagerInput): Promise<RegisterManagerOutput> {
		const userWithSameEmail = await this.managersRepository.findByEmail(email)

		if (userWithSameEmail) {
			return left(new ManagerAlreadyExistsError(email))
		}

		const hashedPassword = await this.hashGenerator.hash(password)

		const manager = Manager.create({
			name,
			email,
			password: hashedPassword,
		})

		await this.managersRepository.create(manager)

		return right({ manager })
	}
}
