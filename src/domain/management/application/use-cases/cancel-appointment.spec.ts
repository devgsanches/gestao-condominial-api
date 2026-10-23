import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@/test/factories/make-appointment'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAppointmentsRepository } from '@/test/repositories/in-memory-appointments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { CancelAppointmentsUseCase } from './cancel-appointment'

describe('CancelAppointmentsUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAppointmentsRepository: InMemoryAppointmentsRepository

	let sut: CancelAppointmentsUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryAppointmentsRepository = new InMemoryAppointmentsRepository()

		sut = new CancelAppointmentsUseCase(
			inMemoryCondominiumsRepository,
			inMemoryAppointmentsRepository,
		)
	})

	it('should be able to cancel a meeting.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const meeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
		})

		await inMemoryAppointmentsRepository.create(meeting)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			appointmentId: meeting.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.appointment.id).toEqual(meeting.id)
			expect(response.result.appointment.canceledAt).toBeInstanceOf(Date)
		}
	})

	it('should not be able to cancel a meeting if the manager is not the manager of the condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: new UniqueEntityId(),
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const meeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
		})

		await inMemoryAppointmentsRepository.create(meeting)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			appointmentId: meeting.id,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})

	it('should not be able to cancel an appointment from another condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const meeting = makeAppointment('meeting', {
			condominiumId: new UniqueEntityId(),
		})

		await inMemoryAppointmentsRepository.create(meeting)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			appointmentId: meeting.id,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})
})
