import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAdmin } from '@/test/factories/make-admin'
import { makeCondominium } from '@/test/factories/make-condominium'
import { InMemoryAdminsRepository } from '@/test/repositories/in-memory-admins-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { AdminAlreadyLinkedError } from './errors/admin-already-linked-error'
import { AdminNotFoundError } from './errors/admin-not-found-error'
import { LinkAdminToCondominiumUseCase } from './link-admin-to-condominium'

describe('LinkAdminToCondominiumUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAdminsRepository: InMemoryAdminsRepository

	let sut: LinkAdminToCondominiumUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryAdminsRepository = new InMemoryAdminsRepository()

		sut = new LinkAdminToCondominiumUseCase(
			inMemoryCondominiumsRepository,
			inMemoryAdminsRepository,
		)
	})

	it('should allow the manager to link an admin to the condominium', async () => {
		const managerId = new UniqueEntityId()
		const condominium = makeCondominium({ managerId })
		const admin = makeAdmin({ email: 'ana@example.com' })

		await inMemoryCondominiumsRepository.create(condominium)
		await inMemoryAdminsRepository.create(admin)

		const response = await sut.execute({
			managerId,
			condominiumId: condominium.id,
			adminEmail: 'ana@example.com',
		})

		expect(response.isRight()).toBe(true)
		expect(
			await inMemoryAdminsRepository.isAdminOfCondominium(
				admin.id,
				condominium.id,
			),
		).toBe(true)
	})

	it('should not link when the condominium does not exist', async () => {
		const response = await sut.execute({
			managerId: new UniqueEntityId(),
			condominiumId: new UniqueEntityId(),
			adminEmail: 'ana@example.com',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})

	it('should not allow a manager of another condominium to link an admin', async () => {
		const condominium = makeCondominium({ managerId: new UniqueEntityId() })
		const admin = makeAdmin({ email: 'ana@example.com' })

		await inMemoryCondominiumsRepository.create(condominium)
		await inMemoryAdminsRepository.create(admin)

		const response = await sut.execute({
			managerId: new UniqueEntityId(),
			condominiumId: condominium.id,
			adminEmail: 'ana@example.com',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
		expect(inMemoryAdminsRepository.condominiumLinks).toHaveLength(0)
	})

	it('should not link an admin that does not exist', async () => {
		const managerId = new UniqueEntityId()
		const condominium = makeCondominium({ managerId })

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId,
			condominiumId: condominium.id,
			adminEmail: 'ninguem@example.com',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(AdminNotFoundError)
		}
	})

	it('should not link the same admin twice', async () => {
		const managerId = new UniqueEntityId()
		const condominium = makeCondominium({ managerId })
		const admin = makeAdmin({ email: 'ana@example.com' })

		await inMemoryCondominiumsRepository.create(condominium)
		await inMemoryAdminsRepository.create(admin)
		await inMemoryAdminsRepository.linkToCondominium(admin.id, condominium.id)

		const response = await sut.execute({
			managerId,
			condominiumId: condominium.id,
			adminEmail: 'ana@example.com',
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(AdminAlreadyLinkedError)
		}
		expect(inMemoryAdminsRepository.condominiumLinks).toHaveLength(1)
	})
})
