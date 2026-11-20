import { MaintenanceType } from '@generated/prisma/enums'
import { UnauthorizedException } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '@/domain/management/enterprise/entities/address'
import { makeAppointment } from '@/test/factories/make-appointment'
import { makeCondominium } from '@/test/factories/make-condominium'
import { makeMaintenance } from '@/test/factories/make-maintenance'
import { makeManager } from '@/test/factories/make-manager'
import { InMemoryAddressesRepository } from '@/test/repositories/in-memory-addresses-repository'
import { InMemoryAdminsRepository } from '@/test/repositories/in-memory-admins-repository'
import { InMemoryAppointmentsRepository } from '@/test/repositories/in-memory-appointments-repository'
import { InMemoryCondominiumsRepository } from '@/test/repositories/in-memory-condominiums-repository'
import { InMemoryContractAttachmentsRepository } from '@/test/repositories/in-memory-contract-attachments'
import { InMemoryContractsRepository } from '@/test/repositories/in-memory-contracts-repository'
import { InMemoryMaintenancesRepository } from '@/test/repositories/in-memory-maintenances-repository'
import type { Condominium } from '../../enterprise/entities/condominium'
import type { Manager } from '../../enterprise/entities/manager'
import { CondominiumInformationNotFoundError } from './errors/condominium-information-not-found-error'
import { FetchCondominiumDashboardUseCase } from './fetch-condominium-dashboard'

describe('FetchCondominiumDashboardUseCase', () => {
	let inMemoryAddressesRepository: InMemoryAddressesRepository
	let inMemoryMaintenancesRepository: InMemoryMaintenancesRepository
	let inMemoryAppointmentsRepository: InMemoryAppointmentsRepository
	let inMemoryCondominiumsRepository: InMemoryCondominiumsRepository

	let manager: Manager
	let condominium: Condominium

	let sut: FetchCondominiumDashboardUseCase

	beforeEach(async () => {
		inMemoryAddressesRepository = new InMemoryAddressesRepository()
		inMemoryMaintenancesRepository = new InMemoryMaintenancesRepository(
			new InMemoryContractsRepository(
				new InMemoryContractAttachmentsRepository(),
			),
		)
		inMemoryAppointmentsRepository = new InMemoryAppointmentsRepository()
		inMemoryCondominiumsRepository = new InMemoryCondominiumsRepository(
			inMemoryAddressesRepository,
			inMemoryMaintenancesRepository,
			inMemoryAppointmentsRepository,
		)

		sut = new FetchCondominiumDashboardUseCase(
			inMemoryCondominiumsRepository,
			new InMemoryAdminsRepository(),
		) // system under test

		manager = makeManager()

		const address = Address.create({
			zipCode: '11060-001',
			street: 'Av. Ana Costa',
			number: 480,
			neighborhood: 'Gonzaga',
			city: 'Santos',
			state: 'SP',
			country: 'Brasil',
		})
		await inMemoryAddressesRepository.create(address)

		condominium = makeCondominium({
			managerId: manager.id,
			addressId: address.id,
			name: 'Residencial Vila Nova',
		})
		await inMemoryCondominiumsRepository.create(condominium)
	})

	it('should return the dashboard for the condominium manager', async () => {
		await inMemoryMaintenancesRepository.create(
			makeMaintenance({
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: 'month',
				title: 'Bombas',
			}),
		)
		await inMemoryAppointmentsRepository.create(
			makeAppointment('meeting', {
				condominiumId: condominium.id,
				scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			}),
		)

		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: condominium.id,
		})

		expect(response.isRight()).toBe(true)
		if (response.isRight()) {
			expect(response.result.dashboard).toMatchObject({
				condominiumName: 'Residencial Vila Nova',
				totalActiveMaintenancesCount: 1,
				periodicMaintenancesWithoutContractCount: 1,
				scheduledMeetingsCount: 1,
			})
		}
	})

	it('should not return the dashboard to another manager', async () => {
		const response = await sut.execute({
			managerId: new UniqueEntityId('other-manager'),
			condominiumId: condominium.id,
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(UnauthorizedException)
		}
	})

	it('should return not found for an unknown condominium', async () => {
		const response = await sut.execute({
			managerId: manager.id,
			condominiumId: new UniqueEntityId('unknown'),
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(
				CondominiumInformationNotFoundError,
			)
		}
	})
})
