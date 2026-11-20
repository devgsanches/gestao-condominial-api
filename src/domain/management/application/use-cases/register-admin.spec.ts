import { UserRole } from '@generated/prisma/enums'
import { Admin } from '@/domain/management/enterprise/entities/admin'
import { FakeHasher } from '@/test/cryptography/fake-hasher'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAdminsRepository } from '@/test/repositories/in-memory-admins-repository'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { AdminAlreadyExistsError } from './errors/admin-already-exists-error'
import { RegisterAdminUseCase } from './register-admin'

describe('RegisterAdminUseCase', () => {
	let inMemoryAdminsRepository: InMemoryAdminsRepository
	let inMemoryManagersRepository: InMemoryManagersRepository
	let sut: RegisterAdminUseCase

	beforeEach(() => {
		inMemoryAdminsRepository = new InMemoryAdminsRepository()
		inMemoryManagersRepository = new InMemoryManagersRepository()

		sut = new RegisterAdminUseCase(
			inMemoryAdminsRepository,
			inMemoryManagersRepository,
			new FakeHasher(),
		)
	})

	it('should be able to register an admin', async () => {
		const response = await sut.execute({
			name: 'Ana Admin',
			email: 'ana@example.com',
			password: '123456',
		})

		expect(response.isRight()).toBe(true)

		if (response.isRight()) {
			expect(response.result.user).toBeInstanceOf(Admin)
			expect(response.result.user.role).toBe(UserRole.CONDOMINIUM_ADMIN)
			expect(inMemoryAdminsRepository.items).toHaveLength(1)
			expect(inMemoryAdminsRepository.items[0].email).toBe('ana@example.com')
		}
	})

	it('should not register an admin with an email already in use', async () => {
		await sut.execute({
			name: 'Ana Admin',
			email: 'ana@example.com',
			password: '123456',
		})

		const response = await sut.execute({
			name: 'Outra Ana',
			email: 'ana@example.com',
			password: '123456',
		})

		expect(response.isLeft()).toBe(true)

		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(AdminAlreadyExistsError)
		}
	})

	it('should not register an admin with the email of a manager', async () => {
		await inMemoryManagersRepository.create(
			makeManager({ email: 'sindico@example.com' }),
		)

		const response = await sut.execute({
			name: 'Ana Admin',
			email: 'sindico@example.com',
			password: '123456',
		})

		expect(response.isLeft()).toBe(true)

		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(AdminAlreadyExistsError)
		}
	})
})
