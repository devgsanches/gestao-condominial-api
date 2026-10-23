import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '@/domain/management/enterprise/entities/address'
import { makeAppointment } from '@/test/factories/make-appointment'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeContract } from '@/test/factories/make-contract'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAddressesRepository } from '@/test/repositories/in-memory-addresses-repository'
import { InMemoryAppointmentsRepository } from '@/test/repositories/in-memory-appointments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryContractsRepository } from '@/test/repositories/in-memory-contracts-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import { GetCondominiumUseCase } from './get-condominium'

function daysFromNow(days: number) {
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date
}

describe('GetCondominiumUseCase', () => {
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository
	let inMemoryAddressesRepository: InMemoryAddressesRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository
	let inMemoryContractsRepository: InMemoryContractsRepository
	let inMemoryAppointmentsRepository: InMemoryAppointmentsRepository
	let sut: GetCondominiumUseCase

	beforeEach(() => {
		inMemoryAddressesRepository = new InMemoryAddressesRepository()
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository(
			inMemoryAddressesRepository,
		)
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository()
		inMemoryContractsRepository = new InMemoryContractsRepository()
		inMemoryAppointmentsRepository = new InMemoryAppointmentsRepository()

		sut = new GetCondominiumUseCase(
			inMemoryCondominiumsRepository,
			inMemoryAddressesRepository,
			inMemoryMaintenancesRepository,
			inMemoryContractsRepository,
			inMemoryAppointmentsRepository,
		)
	})

	it('should return the dashboard read model for the condominium manager', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const address = Address.create(
			{
				zipCode: '11060-001',
				street: 'Av. Ana Costa',
				number: 480,
				neighborhood: 'Gonzaga',
				city: 'Santos',
				state: 'SP',
				country: 'Brasil',
			},
			new UniqueEntityId('address-1'),
		)

		await inMemoryAddressesRepository.create(address)

		const condominium = makeCondominium({
			managerId: manager.id,
			addressId: address.id,
			name: 'Residencial Vila Nova',
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const generalMaintenance = makeMaintenance({
			condominiumId: condominium.id,
			type: 'general',
			title: 'Troca de lâmpadas',
		})

		const periodicWithContract = makeMaintenance({
			condominiumId: condominium.id,
			type: 'periodic',
			periodicity: 'month',
			title: 'Elevador',
		})

		const periodicWithoutContract = makeMaintenance({
			condominiumId: condominium.id,
			type: 'periodic',
			periodicity: 'semester',
			title: "Limpeza da caixa d'água",
		})

		const canceledMaintenance = makeMaintenance({
			condominiumId: condominium.id,
			type: 'general',
			title: 'Manutenção cancelada',
			canceledAt: new Date(),
		})

		await inMemoryMaintenancesRepository.create(generalMaintenance)
		await inMemoryMaintenancesRepository.create(periodicWithContract)
		await inMemoryMaintenancesRepository.create(periodicWithoutContract)
		await inMemoryMaintenancesRepository.create(canceledMaintenance)

		await inMemoryContractsRepository.create(
			makeContract({
				maintenanceId: periodicWithContract.id,
			}),
		)

		const nextMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Vistoria com a construtora',
			scheduledAt: daysFromNow(6),
		})

		const laterAssembly = makeAppointment('assembly', {
			condominiumId: condominium.id,
			title: 'Assembleia ordinária',
			scheduledAt: daysFromNow(20),
		})

		const pastMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião passada',
			scheduledAt: daysFromNow(-2),
		})

		const canceledMeeting = makeAppointment('meeting', {
			condominiumId: condominium.id,
			title: 'Reunião cancelada',
			scheduledAt: daysFromNow(3),
			canceledAt: new Date(),
		})

		await inMemoryAppointmentsRepository.create(nextMeeting)
		await inMemoryAppointmentsRepository.create(laterAssembly)
		await inMemoryAppointmentsRepository.create(pastMeeting)
		await inMemoryAppointmentsRepository.create(canceledMeeting)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)

		if (response.isRight()) {
			expect(response.result.condominium.id).toEqual(condominium.id)
			expect(response.result.condominium.name).toBe('Residencial Vila Nova')
			expect(response.result.address).toEqual(address)
			expect(response.result.activeMaintenancesCount).toBe(3)
			expect(response.result.periodicWithoutContractCount).toBe(1)
			expect(response.result.periodicWithoutContract).toEqual([
				periodicWithoutContract,
			])
			expect(response.result.scheduledAppointmentsCount).toBe(2)
			expect(response.result.nextAppointment).toEqual(nextMeeting)
		}
	})

	it('should return nextAppointment as null when there is no upcoming appointment', async () => {
		const manager = makeManager()
		const address = Address.create({
			zipCode: '01310-100',
			street: 'Avenida Paulista',
			number: 1000,
			neighborhood: 'Bela Vista',
			city: 'São Paulo',
			state: 'SP',
			country: 'Brasil',
		})

		await inMemoryAddressesRepository.create(address)

		const condominium = makeCondominium({
			managerId: manager.id,
			addressId: address.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)

		if (response.isRight()) {
			expect(response.result.nextAppointment).toBeNull()
			expect(response.result.scheduledAppointmentsCount).toBe(0)
			expect(response.result.activeMaintenancesCount).toBe(0)
			expect(response.result.periodicWithoutContract).toEqual([])
		}
	})

	it('should not be possible for a manager to get a condominium that is not theirs.', async () => {
		const manager = makeManager({
			name: 'Guilherme Sanches',
		})

		const condominium = makeCondominium({
			managerId: manager.id,
		})

		await inMemoryCondominiumsRepository.create(condominium)

		const response = await sut.execute({
			managerId: new UniqueEntityId(),
			condominiumId: condominium.id,
		})

		expect(response.isLeft()).toBe(true)
		expect(response.isRight()).toBe(false)

		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})

	it('should return not found when the condominium does not exist', async () => {
		const response = await sut.execute({
			managerId: new UniqueEntityId(),
			condominiumId: new UniqueEntityId(),
		})

		expect(response.isLeft()).toBe(true)

		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(NotFoundException)
		}
	})
})
