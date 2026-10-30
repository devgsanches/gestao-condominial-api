import { randomInt } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { type Either, right } from '@/core/either'
import { AuthCode } from '../../enterprise/entities/auth-code'
import { HashGenerator } from '../cryptography/hash-generator'
import { MailSender } from '../mail/mail-sender'
import { AuthCodesRepository } from '../repositories/auth-codes-repository'
import { ManagersRepository } from '../repositories/managers-repository'

export const FIRST_ACCESS_CODE_EXPIRATION_IN_MINUTES = 15
export const FIRST_ACCESS_CODE_RESEND_INTERVAL_IN_SECONDS = 60

interface RequestFirstAccessCodeInput {
	email: string
}

type RequestFirstAccessCodeOutput = Either<never, null>

@Injectable()
export class RequestFirstAccessCodeUseCase {
	constructor(
		private managersRepository: ManagersRepository,
		private authCodesRepository: AuthCodesRepository,
		private hashGenerator: HashGenerator,
		private mailSender: MailSender,
	) {}

	async execute({
		email,
	}: RequestFirstAccessCodeInput): Promise<RequestFirstAccessCodeOutput> {
		const manager = await this.managersRepository.findByEmail(email)

		// Resposta neutra para não revelar quais e-mails estão cadastrados.
		if (!manager) {
			return right(null)
		}

		const latestCode =
			await this.authCodesRepository.findLatestActiveByEmail(email)

		const resendIntervalInMs =
			FIRST_ACCESS_CODE_RESEND_INTERVAL_IN_SECONDS * 1000

		if (
			latestCode &&
			Date.now() - latestCode.createdAt.getTime() < resendIntervalInMs
		) {
			return right(null)
		}

		const code = randomInt(0, 10_000).toString().padStart(4, '0')

		const authCode = AuthCode.create({
			email,
			code: await this.hashGenerator.hash(code),
			expiresAt: new Date(
				Date.now() + FIRST_ACCESS_CODE_EXPIRATION_IN_MINUTES * 60 * 1000,
			),
		})

		await this.authCodesRepository.create(authCode)

		await this.mailSender.sendFirstAccessCode({
			email,
			code,
			expiresInMinutes: FIRST_ACCESS_CODE_EXPIRATION_IN_MINUTES,
		})

		return right(null)
	}
}
