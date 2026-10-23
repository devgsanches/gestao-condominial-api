import { AppointmentType, UserRole } from '@generated/prisma/enums'
import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

function daysFromNow(days: number) {
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date
}

describe('Fetch appointments (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string
	let canceledMeetingId: string
	let completedMeetingId: string
	let upcomingMeetingId: string
	let canceledAssemblyId: string
	let completedAssemblyId: string
	let upcomingAssemblyId: string

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleRef.createNestApplication()

		app.enableVersioning({
			type: VersioningType.URI,
		})

		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			}),
		)

		prisma = moduleRef.get(PrismaService)

		await app.init()

		const manager = await prisma.user.create({
			data: {
				name: 'John Doe',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'fetch-appointments@example.com',
				password: await hash('123456', 8),
			},
		})

		const address = await prisma.address.create({
			data: {
				zipCode: '11060-001',
				street: 'Av. Ana Costa',
				number: 480,
				neighborhood: 'Gonzaga',
				city: 'Santos',
				state: 'SP',
				country: 'Brasil',
			},
		})

		const condominium = await prisma.condominium.create({
			data: {
				name: 'Residencial Fetch Appointments',
				slug: 'residencial-fetch-appointments',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const canceledMeeting = await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.MEETING,
				title: 'Reuniao cancelada',
				description: 'Nao deve entrar em upcoming',
				scheduledAt: daysFromNow(3),
				canceledAt: new Date(),
			},
		})

		canceledMeetingId = canceledMeeting.id

		const completedMeeting = await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.MEETING,
				title: 'Reuniao passada',
				description: 'Ja realizada',
				scheduledAt: daysFromNow(-2),
			},
		})

		completedMeetingId = completedMeeting.id

		const upcomingMeeting = await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.MEETING,
				title: 'Reuniao proxima',
				description: 'Ainda vai acontecer',
				scheduledAt: daysFromNow(6),
			},
		})

		upcomingMeetingId = upcomingMeeting.id

		const canceledAssembly = await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.ASSEMBLY,
				title: 'Assembleia cancelada',
				description: 'Nao deve entrar em upcoming',
				scheduledAt: daysFromNow(3),
				canceledAt: new Date(),
			},
		})

		canceledAssemblyId = canceledAssembly.id

		const completedAssembly = await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.ASSEMBLY,
				title: 'Assembleia passada',
				description: 'Ja realizada',
				scheduledAt: daysFromNow(-2),
			},
		})

		completedAssemblyId = completedAssembly.id

		const upcomingAssembly = await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.ASSEMBLY,
				title: 'Assembleia proxima',
				description: 'Ainda vai acontecer',
				scheduledAt: daysFromNow(6),
			},
		})

		upcomingAssemblyId = upcomingAssembly.id

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'fetch-appointments@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/condominium/:condominiumId/appointments', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/appointments`)
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.canceled).toHaveLength(2)
		expect(response.body.canceled).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: canceledMeetingId,
					type: 'meeting',
				}),
				expect.objectContaining({
					id: canceledAssemblyId,
					type: 'assembly',
				}),
			]),
		)
		expect(response.body.completed).toHaveLength(2)
		expect(response.body.completed).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: completedMeetingId,
					type: 'meeting',
				}),
				expect.objectContaining({
					id: completedAssemblyId,
					type: 'assembly',
				}),
			]),
		)
		expect(response.body.upcoming).toHaveLength(2)
		expect(response.body.upcoming).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: upcomingMeetingId,
					type: 'meeting',
				}),
				expect.objectContaining({
					id: upcomingAssemblyId,
					type: 'assembly',
				}),
			]),
		)
	})

	test('[GET] /v1/condominium/:condominiumId/appointments?type=meeting', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/appointments`)
			.query({ type: 'meeting' })
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.canceled).toHaveLength(1)
		expect(response.body.canceled[0]).toEqual(
			expect.objectContaining({
				id: canceledMeetingId,
				type: 'meeting',
				title: 'Reuniao cancelada',
			}),
		)
		expect(response.body.completed).toHaveLength(1)
		expect(response.body.completed[0]).toEqual(
			expect.objectContaining({
				id: completedMeetingId,
				type: 'meeting',
				title: 'Reuniao passada',
			}),
		)
		expect(response.body.upcoming).toHaveLength(1)
		expect(response.body.upcoming[0]).toEqual(
			expect.objectContaining({
				id: upcomingMeetingId,
				type: 'meeting',
				title: 'Reuniao proxima',
			}),
		)
	})

	test('[GET] /v1/condominium/:condominiumId/appointments?type=assembly', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/appointments`)
			.query({ type: 'assembly' })
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.canceled).toHaveLength(1)
		expect(response.body.canceled[0]).toEqual(
			expect.objectContaining({
				id: canceledAssemblyId,
				type: 'assembly',
				title: 'Assembleia cancelada',
			}),
		)
		expect(response.body.completed).toHaveLength(1)
		expect(response.body.completed[0]).toEqual(
			expect.objectContaining({
				id: completedAssemblyId,
				type: 'assembly',
				title: 'Assembleia passada',
			}),
		)
		expect(response.body.upcoming).toHaveLength(1)
		expect(response.body.upcoming[0]).toEqual(
			expect.objectContaining({
				id: upcomingAssemblyId,
				type: 'assembly',
				title: 'Assembleia proxima',
			}),
		)
	})
})
