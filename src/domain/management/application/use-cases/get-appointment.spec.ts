import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAppointment } from '@/test/factories/make-appointment'
import { makeCondominium } from '@/test/factories/make-condominium'
import { InMemoryAppointmentsRepository } from '@/test/repositories/in-memory-appointments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { GetAppointmentUseCase } from './get-appointment'

describe('GetAppointmentUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAppointmentsRepository: InMemoryAppointmentsRepository

	let sut: GetAppointmentUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryAppointmentsRepository = new InMemoryAppointmentsRepository()

		sut = new GetAppointmentUseCase(
			inMemoryCondominiumsRepository,
			inMemoryAppointmentsRepository,
		)
	})

	it('should return an appointment of the condominium', async () => {
		const managerId = new UniqueEntityId()
		const condominium = makeCondominium({ managerId })
		await inMemoryCondominiumsRepository.create(condominium)

		const appointment = makeAppointment('assembly', {
			condominiumId: condominium.id,
			location: 'Salão de festas',
		})
		await inMemoryAppointmentsRepository.create(appointment)

		const response = await sut.execute({
			managerId,
			condominiumId: condominium.id,
			appointmentId: appointment.id,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(response.result.appointment).toEqual(appointment)
			expect(response.result.appointment.location).toBe('Salão de festas')
		}
	})

	it('should not return an appointment to someone who is not the manager', async () => {
		const condominium = makeCondominium()
		await inMemoryCondominiumsRepository.create(condominium)

		const appointment = makeAppointment('meeting', {
			condominiumId: condominium.id,
		})
		await inMemoryAppointmentsRepository.create(appointment)

		const response = await sut.execute({
			managerId: new UniqueEntityId(),
			condominiumId: condominium.id,
			appointmentId: appointment.id,
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})

	it('should not return an appointment from another condominium', async () => {
		const managerId = new UniqueEntityId()
		const condominium = makeCondominium({ managerId })
		await inMemoryCondominiumsRepository.create(condominium)

		const appointment = makeAppointment('meeting')
		await inMemoryAppointmentsRepository.create(appointment)

		const response = await sut.execute({
			managerId,
			condominiumId: condominium.id,
			appointmentId: appointment.id,
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})
})
