import {
	AppointmentType,
	Appointment as PrismaAppointment,
} from '@generated/prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppointmentWithType } from '@/domain/management/enterprise/entities/value-objects/appointment-with-type'

const typeToDomainMap = {
	[AppointmentType.MEETING]: 'meeting',
	[AppointmentType.ASSEMBLY]: 'assembly',
} as const

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class PrismaAppointmentWithTypeMapper {
	static toDomain(raw: PrismaAppointment): AppointmentWithType {
		return AppointmentWithType.create({
			appointmentId: new UniqueEntityId(raw.id),
			condominiumId: new UniqueEntityId(raw.condominiumId),
			type: typeToDomainMap[raw.type],
			title: raw.title,
			scheduledAt: new Date(raw.scheduledAt),
			canceledAt: raw.canceledAt ?? undefined,
			createdAt: new Date(raw.createdAt),
			updatedAt: raw.updatedAt ?? undefined,
		})
	}
}
