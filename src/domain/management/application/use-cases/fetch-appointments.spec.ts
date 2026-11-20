import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeAdmin } from '@/test/factories/make-admin'
import { makeAppointment } from '@/test/factories/make-appointment'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAdminsRepository } from '@/test/repositories/in-memory-admins-repository'
import { InMemoryAppointmentsRepository } from '@/test/repositories/in-memory-appointments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { FetchAppointmentsUseCase } from './fetch-appointments'
import { ScheduleType } from './schedule-meeting'

function daysFromNow(days: number) {
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date
}

describe('FetchAppointmentsUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAppointmentsRepository: InMemoryAppointmentsRepository
	let inMemoryAdminsRepository: InMemoryAdminsRepository

	let sut: FetchAppointmentsUseCase

	beforeEach(() => {
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository()
		inMemoryAppointmentsRepository = new InMemoryAppointmentsRepository()
		inMemoryAdminsRepository = new InMemoryAdminsRepository()

		sut = new FetchAppointmentsUseCase(
			inMemoryCondominiumsRepository,
			inMemoryAppointmentsRepository,
			inMemoryAdminsRepository,
		)
	})

	it('should allow an admin linked to the condominium to fetch appointments.', async () => {
		const admin = makeAdmin()
		const condominium = makeCondominium({ managerId: new UniqueEntityId() })

		await inMemoryCondominiumsRepository.create(condominium)
		await inMemoryAdminsRepository.create(admin)
		await inMemoryAdminsRepository.linkToCondominium(admin.id, condominium.id)

		await inMemoryAppointmentsRepository.create(
			makeAppointment('meeting', {
				condominiumId: condominium.id,
				scheduledAt: daysFromNow(3),
			}),
		)

		const response = await sut.execute({
			managerId: admin.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(response.result.upcoming).toHaveLength(1)
		}
	})

	it('should not allow an admin not linked to the condominium to fetch appointments.', async () => {
		const admin = makeAdmin()
		const condominium = makeCondominium({ managerId: new UniqueEntityId() })

		await inMemoryCondominiumsRepository.create(condominium)
		await inMemoryAdminsRepository.create(admin)

		const response = await sut.execute({
			managerId: admin.id,
			condominiumId: condominium.id,
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})

	it('should group meetings into canceled, completed and upcoming ordered by closest date.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const canceledMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião cancelada',
			scheduledAt: daysFromNow(3),
			canceledAt: new Date(),
		})

		const completedMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião passada',
			scheduledAt: daysFromNow(-2),
		})

		const laterUpcomingMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião mais distante',
			scheduledAt: daysFromNow(20),
		})

		const closerUpcomingMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião próxima',
			scheduledAt: daysFromNow(6),
		})

		await inMemoryAppointmentsRepository.create(canceledMeeting)
		await inMemoryAppointmentsRepository.create(completedMeeting)
		await inMemoryAppointmentsRepository.create(laterUpcomingMeeting)
		await inMemoryAppointmentsRepository.create(closerUpcomingMeeting)

		const response = await sut.execute({
			type: ScheduleType.MEETING,
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.canceled).toHaveLength(1)
			expect(response.result.canceled[0].appointmentId).toEqual(
				canceledMeeting.id,
			)

			expect(response.result.completed).toHaveLength(1)
			expect(response.result.completed[0].appointmentId).toEqual(
				completedMeeting.id,
			)

			expect(response.result.upcoming).toHaveLength(2)
			expect(response.result.upcoming[0].appointmentId).toEqual(
				closerUpcomingMeeting.id,
			)
			expect(response.result.upcoming[1].appointmentId).toEqual(
				laterUpcomingMeeting.id,
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

	it('should group assemblies into canceled, completed and upcoming ordered by closest date.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const canceledAssembly = makeAppointment('assembly', {
			condominiumId: condominium.id,
			title: 'Assembleia cancelada',
			scheduledAt: daysFromNow(3),
			canceledAt: new Date(),
		})

		const completedAssembly = makeAppointment('assembly', {
			condominiumId: condominium.id,
			title: 'Assembleia passada',
			scheduledAt: daysFromNow(-2),
		})

		const upcomingAssembly = makeAppointment('assembly', {
			condominiumId: condominium.id,
			title: 'Assembleia próxima',
			scheduledAt: daysFromNow(6),
		})

		await inMemoryAppointmentsRepository.create(canceledAssembly)
		await inMemoryAppointmentsRepository.create(completedAssembly)
		await inMemoryAppointmentsRepository.create(upcomingAssembly)

		const response = await sut.execute({
			type: ScheduleType.ASSEMBLY,
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.canceled).toHaveLength(1)
			expect(response.result.canceled[0].appointmentId).toEqual(
				canceledAssembly.id,
			)

			expect(response.result.completed).toHaveLength(1)
			expect(response.result.completed[0].appointmentId).toEqual(
				completedAssembly.id,
			)

			expect(response.result.upcoming).toHaveLength(1)
			expect(response.result.upcoming[0].appointmentId).toEqual(
				upcomingAssembly.id,
			)
		}
	})

	it('should group meetings and assemblies when type is not provided.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const canceledMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião cancelada',
			scheduledAt: daysFromNow(3),
			canceledAt: new Date(),
		})

		const canceledAssembly = makeAppointment('assembly', {
			condominiumId: condominium.id,
			title: 'Assembleia cancelada',
			scheduledAt: daysFromNow(4),
			canceledAt: new Date(),
		})

		const completedMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião passada',
			scheduledAt: daysFromNow(-2),
		})

		const completedAssembly = makeAppointment('assembly', {
			condominiumId: condominium.id,
			title: 'Assembleia passada',
			scheduledAt: daysFromNow(-3),
		})

		const upcomingMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião próxima',
			scheduledAt: daysFromNow(6),
		})

		const upcomingAssembly = makeAppointment('assembly', {
			condominiumId: condominium.id,
			title: 'Assembleia próxima',
			scheduledAt: daysFromNow(8),
		})

		await inMemoryAppointmentsRepository.create(canceledMeeting)
		await inMemoryAppointmentsRepository.create(canceledAssembly)
		await inMemoryAppointmentsRepository.create(completedMeeting)
		await inMemoryAppointmentsRepository.create(completedAssembly)
		await inMemoryAppointmentsRepository.create(upcomingMeeting)
		await inMemoryAppointmentsRepository.create(upcomingAssembly)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.canceled).toHaveLength(2)
			expect(response.result.canceled).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ appointmentId: canceledMeeting.id }),
					expect.objectContaining({ appointmentId: canceledAssembly.id }),
				]),
			)

			expect(response.result.completed).toHaveLength(2)
			expect(response.result.completed).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ appointmentId: completedMeeting.id }),
					expect.objectContaining({ appointmentId: completedAssembly.id }),
				]),
			)

			expect(response.result.upcoming).toHaveLength(2)
			expect(response.result.upcoming[0].appointmentId).toEqual(
				upcomingMeeting.id,
			)
			expect(response.result.upcoming[1].appointmentId).toEqual(
				upcomingAssembly.id,
			)
		}
	})

	it('should be possible for a manager to fetch an appointment by title at a condominium.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const matchingMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião do elevador',
			scheduledAt: daysFromNow(4),
		})

		const otherMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião de obras',
			scheduledAt: daysFromNow(8),
		})

		await inMemoryAppointmentsRepository.create(matchingMeeting)
		await inMemoryAppointmentsRepository.create(otherMeeting)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
			title: 'elevador',
		})

		expect(response.isRight()).toBe(true)
		expect(response.isLeft()).toBe(false)
		if (response.isRight()) {
			expect(response.result.upcoming).toHaveLength(1)
			expect(response.result.upcoming[0].appointmentId).toEqual(
				matchingMeeting.id,
			)
			expect(response.result.canceled).toHaveLength(0)
			expect(response.result.completed).toHaveLength(0)
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
