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

describe('Schedule (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string

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
				email: 'schedule-appointment@example.com',
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
				name: 'Residencial Schedule Appointment',
				slug: 'residencial-schedule-appointment',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'schedule-appointment@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[POST] /v1/condominium/:condominiumId/appointments meeting', async () => {
		const response = await request(app.getHttpServer())
			.post(`/v1/condominium/${condominiumId}/appointments`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				type: 'meeting',
				title: 'Reuniao de sindicos',
				description: 'Alinhamento mensal sobre manutencoes',
				location: 'Salao de festas',
				scheduledAt: '2026-11-15T19:00:00.000Z',
			})

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual({
			appointment: expect.objectContaining({
				id: expect.any(String),
				condominiumId,
				type: 'meeting',
				title: 'Reuniao de sindicos',
				description: 'Alinhamento mensal sobre manutencoes',
				location: 'Salao de festas',
				scheduledAt: '2026-11-15T19:00:00.000Z',
				canceledAt: null,
			}),
		})

		const appointmentOnDatabase = await prisma.appointment.findFirst({
			where: {
				title: 'Reuniao de sindicos',
				condominiumId,
			},
		})

		expect(appointmentOnDatabase).toBeTruthy()
		expect(appointmentOnDatabase?.type).toBe(AppointmentType.MEETING)
	})
})
