import { MaintenanceType, Prisma } from '@generated/prisma/client'
import { closestTo } from 'date-fns'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CondominiumDashboard } from '@/domain/management/enterprise/entities/value-objects/condominium-dashboard'

const dashboardInclude = {
	maintenances: {
		select: {
			id: true,
			type: true,
			title: true,
			description: true,
			periodicity: true,
			contract: { select: { id: true } },
		},
	},
	appointments: {
		select: {
			id: true,
			type: true,
			title: true,
			description: true,
			scheduledAt: true,
		},
	},
	address: {
		select: {
			id: true,
			street: true,
			number: true,
			city: true,
			state: true,
		},
	},
} satisfies Prisma.CondominiumInclude

type PrismaCondominiumDashboard = Prisma.CondominiumGetPayload<{
	include: typeof dashboardInclude
}>

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaCondominiumDashboardMapper {
	static toDomain(raw: PrismaCondominiumDashboard): CondominiumDashboard {
		const periodicWithoutContractPrisma = raw.maintenances.filter(
			(maintenance) =>
				maintenance.contract === null &&
				maintenance.type === MaintenanceType.PERIODIC &&
				maintenance.periodicity !== null,
		)

		function getNextAppointment(
			appointments: PrismaCondominiumDashboard['appointments'],
		) {
			const now = new Date()

			const currentOrFutureAppointmentDates = appointments.filter(
				(appointment) => appointment.scheduledAt >= now,
			)

			const nextAppointment = closestTo(
				now,
				currentOrFutureAppointmentDates.map(
					(appointment) => appointment.scheduledAt,
				),
			)

			if (!nextAppointment) {
				return null
			}

			const nextAppointmentData = currentOrFutureAppointmentDates.find(
				(appointment) =>
					appointment.scheduledAt.getTime() === nextAppointment.getTime(),
			)

			if (!nextAppointmentData) {
				return null
			}

			return {
				appointmentId: new UniqueEntityId(nextAppointmentData.id),
				type: nextAppointmentData.type,
				title: nextAppointmentData.title,
				description: nextAppointmentData.description,
				scheduledAt: nextAppointmentData.scheduledAt,
			}
		}

		return CondominiumDashboard.create({
			condominiumName: raw.name,
			totalActiveMaintenancesCount: raw.maintenances.length,
			periodicMaintenancesWithoutContractCount:
				periodicWithoutContractPrisma.length,
			scheduledMeetingsCount: raw.appointments.length,
			nextAppointment: getNextAppointment(raw.appointments) ?? null,
			periodicMaintenancesWithoutContract: periodicWithoutContractPrisma.map(
				(maintenance) => ({
					maintenanceId: new UniqueEntityId(maintenance.id),
					type: maintenance.type,
					title: maintenance.title,
					description: maintenance.description,
					// biome-ignore lint/style/noNonNullAssertion: periodicity is not nullable
					periodicity: maintenance.periodicity!,
				}),
			),
			condominiumAddress: {
				street: raw.address.street,
				number: raw.address.number,
				city: raw.address.city,
				state: raw.address.state,
			},
		})
	}
}
