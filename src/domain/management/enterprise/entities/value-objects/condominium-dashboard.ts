import {
	AppointmentType,
	MaintenancePeriodicity,
	MaintenanceType,
} from '@generated/prisma/enums'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

export type PeriodicMaintenancesWithoutContract = {
	maintenanceId: UniqueEntityId
	type: MaintenanceType
	title: string
	description: string
	periodicity: MaintenancePeriodicity
}

export interface CondominiumDashboardProps {
	condominiumName: string
	totalActiveMaintenancesCount: number
	periodicMaintenancesWithoutContractCount: number
	scheduledMeetingsCount: number
	nextAppointment: {
		appointmentId: UniqueEntityId
		type: AppointmentType
		title: string
		description: string
		scheduledAt: Date
	} | null
	periodicMaintenancesWithoutContract: PeriodicMaintenancesWithoutContract[]
	condominiumAddress: {
		street: string
		number: number
		city: string
		state: string
	}
}

export class CondominiumDashboard extends ValueObject<CondominiumDashboardProps> {
	get condominiumName() {
		return this.props.condominiumName
	}

	get totalActiveMaintenancesCount() {
		return this.props.totalActiveMaintenancesCount
	}

	get periodicMaintenancesWithoutContractCount() {
		return this.props.periodicMaintenancesWithoutContractCount
	}

	get scheduledMeetingsCount() {
		return this.props.scheduledMeetingsCount
	}

	get nextAppointment() {
		return this.props.nextAppointment
	}

	get periodicMaintenancesWithoutContract() {
		return this.props.periodicMaintenancesWithoutContract
	}

	get condominiumAddress() {
		return this.props.condominiumAddress
	}

	static create(props: CondominiumDashboardProps) {
		return new CondominiumDashboard(props)
	}
}
