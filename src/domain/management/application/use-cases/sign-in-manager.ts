import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { type Either, right } from '@/core/either'
import { ManagersRepository } from '../repositories/managers-repository'

interface SignInManagerInput {
	email: string
	password: string
}

type SignInManagerOutput = Either<
	UnauthorizedException,
	{
		access_token: string
	}
>

@Injectable()
export class SignInManagerUseCase {
	constructor(
		private managersRepository: ManagersRepository,
		private jwt: JwtService,
	) {}

	async execute({
		email,
		password,
	}: SignInManagerInput): Promise<SignInManagerOutput> {
		const user = await this.managersRepository.findByEmail(email)

		if (!user) {
			throw new UnauthorizedException('User credentials do not match.')
		}

		const isPasswordValid = await compare(password, user.password)

		if (!isPasswordValid) {
			throw new UnauthorizedException('User credentials do not match.')
		}

		const accessToken = this.jwt.sign({ sub: user.id.toString() })

		return right({
			access_token: accessToken,
		})
	}
}
