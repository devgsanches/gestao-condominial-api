import { AuthCode } from '@/domain/management/enterprise/entities/auth-code'
import { FakeEncrypter } from '@/test/cryptography/fake-encrypter'
import { FakeHasher } from '@/test/cryptography/fake-hasher'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAuthCodesRepository } from '@/test/repositories/in-memory-auth-codes-repository'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import type { Manager } from '../../enterprise/entities/manager'
import { ExpiredAuthCodeError } from './errors/expired-auth-code-error'
import { InvalidAuthCodeError } from './errors/invalid-auth-code-error'
import { VerifyFirstAccessCodeUseCase } from './verify-first-access-code'

describe('VerifyFirstAccessCodeUseCase', () => {
	let inMemoryManagersRepository: InMemoryManagersRepository
	let inMemoryAuthCodesRepository: InMemoryAuthCodesRepository
	let manager: Manager

	let sut: VerifyFirstAccessCodeUseCase

	function makeAuthCode(
		override: Partial<{ expiresAt: Date; attempts: number }> = {},
	) {
		return AuthCode.create({
			email: 'sindico@example.com',
			code: '1234-hashed',
			expiresAt: new Date(Date.now() + 15 * 60 * 1000),
			...override,
		})
	}

	beforeEach(async () => {
		inMemoryManagersRepository = new InMemoryManagersRepository()
		inMemoryAuthCodesRepository = new InMemoryAuthCodesRepository()

		sut = new VerifyFirstAccessCodeUseCase(
			inMemoryManagersRepository,
			inMemoryAuthCodesRepository,
			new FakeHasher(),
			new FakeEncrypter(),
		) // system under test

		manager = makeManager({ email: 'sindico@example.com' })
		await inMemoryManagersRepository.create(manager)
	})

	it('should return an access token and mark the code as used', async () => {
		await inMemoryAuthCodesRepository.create(makeAuthCode())

		const response = await sut.execute({
			email: 'sindico@example.com',
			code: '1234',
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(JSON.parse(response.result.access_token)).toEqual({
				sub: manager.id.toString(),
			})
		}
		expect(inMemoryAuthCodesRepository.items[0].usedAt).toEqual(
			expect.any(Date),
		)
	})

	it('should not accept the same code twice', async () => {
		await inMemoryAuthCodesRepository.create(makeAuthCode())

		await sut.execute({ email: 'sindico@example.com', code: '1234' })
		const response = await sut.execute({
			email: 'sindico@example.com',
			code: '1234',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(InvalidAuthCodeError)
		}
	})

	it('should count failed attempts and block the code after the limit', async () => {
		await inMemoryAuthCodesRepository.create(makeAuthCode())

		for (let attempt = 0; attempt < AuthCode.MAX_ATTEMPTS; attempt++) {
			const response = await sut.execute({
				email: 'sindico@example.com',
				code: '0000',
			})

			if (response.isLeft()) {
				expect(response.reason).toBeInstanceOf(InvalidAuthCodeError)
			}
		}

		expect(inMemoryAuthCodesRepository.items[0].attempts).toBe(
			AuthCode.MAX_ATTEMPTS,
		)

		const response = await sut.execute({
			email: 'sindico@example.com',
			code: '1234',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(ExpiredAuthCodeError)
		}
	})

	it('should reject an expired code', async () => {
		await inMemoryAuthCodesRepository.create(
			makeAuthCode({ expiresAt: new Date(Date.now() - 1000) }),
		)

		const response = await sut.execute({
			email: 'sindico@example.com',
			code: '1234',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(ExpiredAuthCodeError)
		}
	})

	it('should reject when no code was requested', async () => {
		const response = await sut.execute({
			email: 'sindico@example.com',
			code: '1234',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(InvalidAuthCodeError)
		}
	})
})
