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

describe('Get appointment (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string
	let appointmentId: string

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
				email: 'get-appointment@example.com',
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
				name: 'Residencial Get Appointment',
				slug: 'residencial-get-appointment',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const appointment = await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.ASSEMBLY,
				title: 'Assembleia Geral Ordinaria',
				description: 'Prestacao de contas do semestre',
				location: 'Salao de festas',
				scheduledAt: new Date('2026-12-10T22:30:00.000Z'),
			},
		})

		appointmentId = appointment.id

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'get-appointment@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/condominium/:condominiumId/appointments/:appointmentId', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/appointments/${appointmentId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send()

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({
			appointment: expect.objectContaining({
				id: appointmentId,
				condominiumId,
				type: 'assembly',
				title: 'Assembleia Geral Ordinaria',
				description: 'Prestacao de contas do semestre',
				location: 'Salao de festas',
				scheduledAt: '2026-12-10T22:30:00.000Z',
				canceledAt: null,
			}),
		})
	})

	test('[GET] /v1/condominium/:condominiumId/appointments/:appointmentId not found', async () => {
		const response = await request(app.getHttpServer())
			.get(
				`/v1/condominium/${condominiumId}/appointments/00000000-0000-0000-0000-000000000000`,
			)
			.set('Authorization', `Bearer ${accessToken}`)
			.send()

		expect(response.statusCode).toBe(404)
	})
})
