import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@/test/factories/make-appointment'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAppointmentsRepository } from '@/test/repositories/in-memory-appointments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { FetchAppointmentsUseCase } from './fetch-appointments'
import { ScheduleType } from './schedule-meeting'

// @TODO: Add coverage and test all possible errors

describe('FetchAppointmentsUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAppointmentsRepository: InMemoryAppointmentsRepository

	let sut: FetchAppointmentsUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryAppointmentsRepository = new InMemoryAppointmentsRepository()

		sut = new FetchAppointmentsUseCase(
			inMemoryCondominiumsRepository,
			inMemoryAppointmentsRepository,
		) // system under test
	})

	it('should be able to fetch meetings by condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 3; i++) {
			const appointment = makeAppointment('meeting', {
				condominiumId: condominium.id,
			})

			await inMemoryAppointmentsRepository.create(appointment)
		}

		const response = await sut.execute({
			type: ScheduleType.MEETING,
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.meetings).toHaveLength(3)
			expect(response.result.meetings).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						condominiumId: condominium.id,
						title: expect.any(String),
						description: expect.any(String),
						createdAt: expect.any(Date),
					}),
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						condominiumId: condominium.id,
						title: expect.any(String),
						description: expect.any(String),
						createdAt: expect.any(Date),
					}),
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						condominiumId: condominium.id,
						title: expect.any(String),
						description: expect.any(String),
						createdAt: expect.any(Date),
					}),
				]),
			)
		}
	})

	it('should not be able to fetch meetings by condominium if the manager is not the manager of the condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: new UniqueEntityId(),
		})

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 3; i++) {
			const appointment = makeAppointment('meeting', {
				condominiumId: condominium.id,
			})

			await inMemoryAppointmentsRepository.create(appointment)
		}

		const response = await sut.execute({
			type: ScheduleType.MEETING,
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})

	it('should be able to fetch assemblies by condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 3; i++) {
			const appointment = makeAppointment('assembly', {
				condominiumId: condominium.id,
			})

			await inMemoryAppointmentsRepository.create(appointment)
		}

		const response = await sut.execute({
			type: ScheduleType.ASSEMBLY,
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.assemblies).toHaveLength(3)
			expect(response.result.assemblies).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						condominiumId: condominium.id,
						title: expect.any(String),
						description: expect.any(String),
						createdAt: expect.any(Date),
					}),
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						condominiumId: condominium.id,
						title: expect.any(String),
						description: expect.any(String),
						createdAt: expect.any(Date),
					}),
					expect.objectContaining({
						id: expect.any(UniqueEntityId),
						condominiumId: condominium.id,
						title: expect.any(String),
						description: expect.any(String),
						createdAt: expect.any(Date),
					}),
				]),
			)
		}
	})

	it('should not be able to fetch assemblies by condominium if the manager is not the manager of the condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: new UniqueEntityId(),
		})

		await inMemoryCondominiumsRepository.create(condominium)

		for (let i = 1; i <= 3; i++) {
			const appointment = makeAppointment('assembly', {
				condominiumId: condominium.id,
			})

			await inMemoryAppointmentsRepository.create(appointment)
		}

		const response = await sut.execute({
			type: ScheduleType.ASSEMBLY,
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})
})
