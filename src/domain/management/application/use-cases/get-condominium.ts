import { MaintenanceType } from '@generated/prisma/enums'
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address } from '../../enterprise/entities/address'
import { Assembly } from '../../enterprise/entities/assembly'
import { Condominium } from '../../enterprise/entities/condominium'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { Meeting } from '../../enterprise/entities/meeting'
import { AddressesRepository } from '../repositories/addresses-repository'
import { AppointmentsRepository } from '../repositories/appointments-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { ContractsRepository } from '../repositories/contracts-repository'
import { MaintenancesRepository } from '../repositories/maintenances-repository'

interface GetCondominiumInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

export type GetCondominiumDashboard = {
	condominium: Condominium
	address: Address
	activeMaintenancesCount: number
	periodicWithoutContractCount: number
	validContractsCount: number
	scheduledAppointmentsCount: number
	nextAppointment: Meeting | Assembly | null
	periodicWithoutContract: Maintenance[]
}

type GetCondominiumOutput = Either<
	NotFoundException | UnauthorizedException,
	GetCondominiumDashboard
>

@Injectable()
export class GetCondominiumUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private addressesRepository: AddressesRepository,
		private maintenancesRepository: MaintenancesRepository,
		private contractsRepository: ContractsRepository,
		private appointmentsRepository: AppointmentsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
	}: GetCondominiumInput): Promise<GetCondominiumOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		if (!condominium.managerId.equals(managerId)) {
			return left(new UnauthorizedException())
		}

		const address = await this.addressesRepository.findById(
			condominium.addressId,
		)

		if (!address) {
			return left(new NotFoundException())
		}

		const maintenances =
			await this.maintenancesRepository.findManyByCondominiumId({
				condominiumId,
				filters: {},
			})

		const activeMaintenances = maintenances.filter(
			(maintenance) => !maintenance.canceledAt,
		)

		const periodicWithoutContract: Maintenance[] = []
		let validContractsCount = 0

		for (const maintenance of activeMaintenances) {
			if (maintenance.type !== MaintenanceType.PERIODIC) {
				continue
			}

			const contract = await this.contractsRepository.findByMaintenanceId(
				maintenance.id,
			)

			if (!contract) {
				periodicWithoutContract.push(maintenance)
				continue
			}

			if (contract.isValid) {
				validContractsCount++
			}
		}

		const now = new Date()

		const [meetings, assemblies] = await Promise.all([
			this.appointmentsRepository.findManyMeetingsByCondominiumId(
				condominiumId,
			),
			this.appointmentsRepository.findManyAssembliesByCondominiumId(
				condominiumId,
			),
		])

		const scheduledAppointments = [...meetings, ...assemblies]
			.filter(
				(appointment) =>
					!appointment.canceledAt && appointment.scheduledAt >= now,
			)
			.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

		return right({
			condominium,
			address,
			activeMaintenancesCount: activeMaintenances.length,
			periodicWithoutContractCount: periodicWithoutContract.length,
			periodicWithoutContract,
			validContractsCount,
			scheduledAppointmentsCount: scheduledAppointments.length,
			nextAppointment: scheduledAppointments[0] ?? null,
		})
	}
}
