import { AppointmentType } from '@generated/prisma/client'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppointmentsRepository } from '@/domain/management/application/repositories/appointments-repository'
import { Assembly } from '@/domain/management/enterprise/entities/assembly'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'
import { PrismaAppointmentMapper } from '../mappers/prisma-appointment-mapper'
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
