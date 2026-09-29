import { type Either, right } from '@/core/either'
import { Manager } from '../../enterprise/entities/manager'
import { IManagersRepository } from '../repositories/managers-repository'

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

export class RegisterManagerUseCase {
	constructor(private managerRepository: IManagersRepository) {}

	async execute({
		name,
		email,
		password,
	}: RegisterManagerInput): Promise<RegisterManagerOutput> {
		const manager = Manager.create({
			name,
			email,
			password,
		})

		await this.managerRepository.create(manager)

		return right({ manager })
	}
}
