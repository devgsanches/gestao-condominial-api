import {
	AppointmentType,
	Prisma,
	Appointment as PrismaAppointment,
} from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Assembly } from '@/domain/management/enterprise/entities/assembly'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaAppointmentMapper {
	static toDomain(raw: PrismaAppointment): Meeting | Assembly {
		if (raw.type === AppointmentType.MEETING) {
			return Meeting.create(
				{
					condominiumId: new UniqueEntityId(raw.condominiumId),
					title: raw.title,
					description: raw.description,
					scheduledAt: new Date(raw.scheduledAt),
					canceledAt: raw.canceledAt ?? undefined,
					createdAt: new Date(raw.createdAt),
					updatedAt: raw.updatedAt ?? undefined,
				},
				new UniqueEntityId(raw.id),
			)
		}

		return Assembly.create(
			{
				condominiumId: new UniqueEntityId(raw.condominiumId),
				title: raw.title,
				description: raw.description,
				scheduledAt: new Date(raw.scheduledAt),
				canceledAt: raw.canceledAt ?? undefined,
				createdAt: new Date(raw.createdAt),
				updatedAt: raw.updatedAt ?? undefined,
			},
			new UniqueEntityId(raw.id),
		)
	}

	static toPrisma(
		appointment: Meeting | Assembly,
	): Prisma.AppointmentUncheckedCreateInput {
		const type =
			appointment instanceof Meeting
				? AppointmentType.MEETING
				: AppointmentType.ASSEMBLY

		return {
			id: appointment.id.toString(),
			condominiumId: appointment.condominiumId.toString(),
			type,
			title: appointment.title,
			description: appointment.description,
			scheduledAt: appointment.scheduledAt,
			canceledAt: appointment.canceledAt,
			createdAt: appointment.createdAt,
			updatedAt: appointment.updatedAt,
		}
	}
}
