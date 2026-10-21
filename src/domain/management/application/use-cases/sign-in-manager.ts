import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { Encrypter } from '../cryptography/encrypter'
import { HashComparer } from '../cryptography/hash-comparer'
import { ManagersRepository } from '../repositories/managers-repository'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

interface SignInManagerInput {
	email: string
	password: string
}

type SignInManagerOutput = Either<
	WrongCredentialsError,
	{
		access_token: string
	}
>

@Injectable()
export class SignInManagerUseCase {
	constructor(
		private managersRepository: ManagersRepository,
		private hashComparer: HashComparer,
		private encrypter: Encrypter,
	) {}

	async execute({
		email,
		password,
	}: SignInManagerInput): Promise<SignInManagerOutput> {
		const user = await this.managersRepository.findByEmail(email)

		if (!user) {
			return left(new WrongCredentialsError())
		}

		const isPasswordValid = await this.hashComparer.compare(
			password,
			user.password,
		)

		if (!isPasswordValid) {
			return left(new WrongCredentialsError())
		}

		const accessToken = await this.encrypter.encrypt({
			sub: user.id.toString(),
		})

		return right({
			access_token: accessToken,
		})
	}
}
