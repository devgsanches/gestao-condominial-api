import { type Either, right } from '@/core/either'
import { Manager } from '../../enterprise/entities/manager'
import { ManagersRepository } from '../repositories/managers-repository'

// @TODO: Habilitar jwt/nestjs e, caso login seja bem-sucedido, retornar token de acesso

interface SignInManagerInput {
	name: string
	email: string
	password: string
}

// erros: Não autorizado
type SignInManagerOutput = Either<
	undefined,
	{
		manager: Manager
	}
>

export class SignInManagerUseCase {
	constructor(private managerRepository: ManagersRepository) {}

	async execute({
		name,
		email,
		password,
	}: SignInManagerInput): Promise<SignInManagerOutput> {
		const manager = Manager.create({
			name,
			email,
			password,
		})

		await this.managerRepository.create(manager)

		return right({ manager })
	}
}
