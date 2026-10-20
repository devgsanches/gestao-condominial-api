import { UserRole } from '@generated/prisma/enums'
import { ConflictException, Injectable } from '@nestjs/common'
import { hash } from 'bcryptjs'
import { type Either, right } from '@/core/either'
import { Manager } from '../../enterprise/entities/manager'
import { ManagersRepository } from '../repositories/managers-repository'

interface RegisterManagerInput {
	name: string
	email: string
	password: string
}

// erros: conflito e não autorizado
type RegisterManagerOutput = Either<
	undefined,
	{
		manager: Manager
	}
>

@Injectable()
export class RegisterManagerUseCase {
	constructor(private managersRepository: ManagersRepository) {}

	async execute({
		name,
		email,
		password,
	}: RegisterManagerInput): Promise<RegisterManagerOutput> {
		const userWithSameEmail = await this.managersRepository.findByEmail(email)

		if (userWithSameEmail) {
			throw new ConflictException(
				'User with same e-mail address already exists.',
			)
		}

		const hashedPassword = await hash(password, 8)

		const manager = Manager.create({
			name,
			email,
			password: hashedPassword,
		})

		await this.managersRepository.create(manager)

		return right({ manager })
	}
}
