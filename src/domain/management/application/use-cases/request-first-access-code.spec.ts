import { FakeHasher } from '@/test/cryptography/fake-hasher'
import { makeManager } from '@/test/factories/make-manager'
import { FakeMailSender } from '@/test/mail/fake-mail-sender'
import { InMemoryAuthCodesRepository } from '@/test/repositories/in-memory-auth-codes-repository'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import {
	FIRST_ACCESS_CODE_EXPIRATION_IN_MINUTES,
	RequestFirstAccessCodeUseCase,
} from './request-first-access-code'

describe('RequestFirstAccessCodeUseCase', () => {
	let inMemoryManagersRepository: InMemoryManagersRepository
	let inMemoryAuthCodesRepository: InMemoryAuthCodesRepository
	let fakeMailSender: FakeMailSender

	let sut: RequestFirstAccessCodeUseCase

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-10-29T12:00:00.000Z'))

		inMemoryManagersRepository = new InMemoryManagersRepository()
		inMemoryAuthCodesRepository = new InMemoryAuthCodesRepository()
		fakeMailSender = new FakeMailSender()

		sut = new RequestFirstAccessCodeUseCase(
			inMemoryManagersRepository,
			inMemoryAuthCodesRepository,
			new FakeHasher(),
			fakeMailSender,
		) // system under test
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should create a hashed 4 digit code and send it by email', async () => {
		await inMemoryManagersRepository.create(
			makeManager({ email: 'sindico@example.com' }),
		)

		const response = await sut.execute({ email: 'sindico@example.com' })

		expect(response.isRight()).toBe(true)
		expect(fakeMailSender.firstAccessCodes).toHaveLength(1)

		const [mail] = fakeMailSender.firstAccessCodes

		expect(mail).toEqual({
			email: 'sindico@example.com',
			code: expect.stringMatching(/^\d{4}$/),
			expiresInMinutes: FIRST_ACCESS_CODE_EXPIRATION_IN_MINUTES,
		})
		expect(inMemoryAuthCodesRepository.items[0]).toMatchObject({
			email: 'sindico@example.com',
			code: `${mail.code}-hashed`,
			attempts: 0,
			expiresAt: new Date('2026-10-29T12:15:00.000Z'),
		})
	})

	it('should answer neutrally when the email is not registered', async () => {
		const response = await sut.execute({ email: 'unknown@example.com' })

		expect(response.isRight()).toBe(true)
		expect(fakeMailSender.firstAccessCodes).toHaveLength(0)
		expect(inMemoryAuthCodesRepository.items).toHaveLength(0)
	})

	it('should not send a new code before the resend interval', async () => {
		await inMemoryManagersRepository.create(
			makeManager({ email: 'sindico@example.com' }),
		)

		await sut.execute({ email: 'sindico@example.com' })

		vi.advanceTimersByTime(30 * 1000)
		await sut.execute({ email: 'sindico@example.com' })

		expect(fakeMailSender.firstAccessCodes).toHaveLength(1)

		vi.advanceTimersByTime(31 * 1000)
		await sut.execute({ email: 'sindico@example.com' })

		expect(fakeMailSender.firstAccessCodes).toHaveLength(2)
		expect(inMemoryAuthCodesRepository.items).toHaveLength(2)
	})
})
