import { FakeHasher } from '@/test/cryptography/fake-hasher'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { RegisterManagerUseCase } from './register-manager'

// @TODO: Add coverage and test all possible errors

describe.skip('RegisterManagerUseCaseUseCase', () => {
	let inMemoryManagersRepository: InMemoryManagersRepository
	let sut: RegisterManagerUseCase

	beforeEach(() => {
		inMemoryManagersRepository = new InMemoryManagersRepository()

		sut = new RegisterManagerUseCase(
			inMemoryManagersRepository,
			new FakeHasher(),
		) // system under test
	})

	it('should be able to register a manager (sign-up)', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const response = await sut.execute(manager)

		if (response.isRight()) {
			const { manager } = response.result

			expect(manager).toMatchObject(
				expect.objectContaining({
					id: manager.id,
					name: 'Guilherme Sanches',
				}),
			)
		}
	})
})
