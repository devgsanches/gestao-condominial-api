import { AppointmentType } from '@generated/prisma/client'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import { Assembly } from '@/domain/management/enterprise/entities/assembly'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'
import { AppointmentWithType } from '@/domain/management/enterprise/entities/value-objects/appointment-with-type'
import { PrismaAppointmentMapper } from '../mappers/prisma-appointment-mapper'
import { PrismaAppointmentWithTypeMapper } from '../mappers/prisma-appointment-with-type-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAppointmentsRepository implements AppointmentsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(appointment: Meeting | Assembly): Promise<void> {
		const appointmentPrisma = PrismaAppointmentMapper.toPrisma(appointment)

		await this.prisma.appointment.create({
			data: {
				...appointmentPrisma,
			},
		})
	}

	async findById(id: UniqueEntityId): Promise<Meeting | Assembly | null> {
		const appointment = await this.prisma.appointment.findUnique({
			where: {
				id: id.toValue(),
			},
		})

		if (!appointment) {
			return null
		}

		return PrismaAppointmentMapper.toDomain(appointment)
	}

	async findManyMeetingsByCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<Meeting[]> {
		const appointments = await this.prisma.appointment.findMany({
			where: {
				condominiumId: condominiumId.toValue(),
				type: AppointmentType.MEETING,
			},
		})

		return appointments.map(
			(a) => PrismaAppointmentMapper.toDomain(a) as Meeting,
		)
	}

	async findManyAssembliesByCondominiumId(
		condominiumId: UniqueEntityId,
	): Promise<Assembly[]> {
		const appointments = await this.prisma.appointment.findMany({
			where: {
				condominiumId: condominiumId.toValue(),
				type: AppointmentType.ASSEMBLY,
			},
		})

		return appointments.map(
			(a) => PrismaAppointmentMapper.toDomain(a) as Assembly,
		)
	}

	async findManyByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: 'meeting' | 'assembly' }
	}): Promise<AppointmentWithType[]> {
		const where: Record<string, unknown> = {
			condominiumId: condominiumId.toValue(),
		}

		if (filters.title) {
			where.title = { contains: filters.title, mode: 'insensitive' }
		}

		if (filters.type) {
			where.type =
				filters.type === 'meeting'
					? AppointmentType.MEETING
					: AppointmentType.ASSEMBLY
		}

		const appointments = await this.prisma.appointment.findMany({
			where,
		})

		return appointments.map(PrismaAppointmentWithTypeMapper.toDomain)
	}

	async update(
		appointment: Meeting | Assembly,
	): Promise<Meeting | Assembly | null> {
		const appointmentPrisma = PrismaAppointmentMapper.toPrisma(appointment)

		const updated = await this.prisma.appointment.update({
			where: {
				id: appointment.id.toValue(),
			},
			data: {
				...appointmentPrisma,
			},
		})

		return PrismaAppointmentMapper.toDomain(updated)
	}
}
