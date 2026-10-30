import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { Encrypter } from '../cryptography/encrypter'
import { HashComparer } from '../cryptography/hash-comparer'
import { AuthCodesRepository } from '../repositories/auth-codes-repository'
import { ManagersRepository } from '../repositories/managers-repository'
import { ExpiredAuthCodeError } from './errors/expired-auth-code-error'
import { InvalidAuthCodeError } from './errors/invalid-auth-code-error'

interface VerifyFirstAccessCodeInput {
	email: string
	code: string
}

type VerifyFirstAccessCodeOutput = Either<
	InvalidAuthCodeError | ExpiredAuthCodeError,
	{
		access_token: string
	}
>

@Injectable()
export class VerifyFirstAccessCodeUseCase {
	constructor(
		private managersRepository: ManagersRepository,
		private authCodesRepository: AuthCodesRepository,
		private hashComparer: HashComparer,
		private encrypter: Encrypter,
	) {}

	async execute({
		email,
		code,
	}: VerifyFirstAccessCodeInput): Promise<VerifyFirstAccessCodeOutput> {
		const authCode =
			await this.authCodesRepository.findLatestActiveByEmail(email)

		if (!authCode) {
			return left(new InvalidAuthCodeError())
		}

		if (authCode.isExpired() || authCode.hasReachedMaxAttempts()) {
			return left(new ExpiredAuthCodeError())
		}

		const isCodeValid = await this.hashComparer.compare(code, authCode.code)

		if (!isCodeValid) {
			authCode.registerFailedAttempt()
			await this.authCodesRepository.save(authCode)

			return left(new InvalidAuthCodeError())
		}

		const manager = await this.managersRepository.findByEmail(email)

		if (!manager) {
			return left(new InvalidAuthCodeError())
		}

		authCode.markAsUsed()
		await this.authCodesRepository.save(authCode)

		const accessToken = await this.encrypter.encrypt({
			sub: manager.id.toString(),
		})

		return right({
			access_token: accessToken,
		})
	}
}
