import { faker } from '@faker-js/faker'
import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAppointmentsRepository } from '@/test/repositories/in-memory-appointments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { ScheduleMeetingUseCase, ScheduleType } from './schedule-meeting'

// @TODO: Add coverage and test all possible errors

describe('ScheduleMeetingUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAppointmentsRepository: InMemoryAppointmentsRepository

	let scheduledAt: Date
	let sut: ScheduleMeetingUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryAppointmentsRepository = new InMemoryAppointmentsRepository()

		scheduledAt = faker.date.future()

		sut = new ScheduleMeetingUseCase(
			inMemoryCondominiumsRepository,
			inMemoryAppointmentsRepository,
		) // system under test
	})

	it('should be possible for a manager to schedule a meeting.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			type: ScheduleType.MEETING,
			title: 'Reunião Teste',
			description: 'Descrição da reunião teste',
			scheduledAt,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.meeting).toMatchObject({
				condominiumId: condominium.id,
				title: 'Reunião Teste',
				description: 'Descrição da reunião teste',
			})
			expect(response.result.assembly).toBeUndefined()
		}
	})

	it('should be possible for a manager to schedule a assembly.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
			name: 'Condomínio Teste',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			type: ScheduleType.ASSEMBLY,
			title: 'Assembleia Teste',
			description: 'Descrição da assembleia teste',
			scheduledAt,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.assembly).toMatchObject({
				condominiumId: condominium.id,
				title: 'Assembleia Teste',
				description: 'Descrição da assembleia teste',
			})
			expect(response.result.meeting).toBeUndefined()
		}
	})

	it('should not be possible for a manager to schedule a meeting in a condominium that is not theirs.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const randomCondominium = makeCondominium({
			managerId: new UniqueEntityId(),
		})

		await inMemoryCondominiumsRepository.create(randomCondominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: randomCondominium.id,
			type: ScheduleType.MEETING,
			title: 'Reunião Teste',
			description: 'Descrição da reunião teste',
			scheduledAt,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})

	it('should not be possible for a manager to schedule a assembly in a condominium that is not theirs.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const randomCondominium = makeCondominium({
			managerId: new UniqueEntityId(),
		})

		await inMemoryCondominiumsRepository.create(randomCondominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: randomCondominium.id,
			type: ScheduleType.ASSEMBLY,
			title: 'Assembleia Teste',
			description: 'Descrição da assembleia teste',
			scheduledAt,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})
})
