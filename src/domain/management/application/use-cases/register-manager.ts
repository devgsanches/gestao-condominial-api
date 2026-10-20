import { UserRole } from '@generated/prisma/enums'
import { ConflictException, Injectable } from '@nestjs/common'
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
	constructor(private managerRepository: ManagersRepository) {}

	async execute({
		name,
		email,
		password,
	}: RegisterManagerInput): Promise<RegisterManagerOutput> {
		const userWithSameEmail = await this.prisma.user.findUnique({
			where: {
				email,
			},
		})

		if (userWithSameEmail) {
			throw new ConflictException(
				'User with same e-mail address already exists.',
			)
		}

		const hashedPassword = await hash(password, 8)

		await this.prisma.user.create({
			data: {
				name,
				role: UserRole.CONDOMINIUM_MANAGER,
				email,
				password: hashedPassword,
			},
		})
		const manager = Manager.create({
			name,
			email,
			password,
		})

		await this.managerRepository.create(manager)

		return right({ manager })
	}
}
