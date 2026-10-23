import {
	MaintenancePeriodicity,
	MaintenanceType,
	UserRole,
} from '@generated/prisma/enums'
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

describe('Cancel maintenance (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string
	let maintenanceId: string

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
				email: 'cancel-maintenance@example.com',
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
				name: 'Residencial Cancel Maintenance',
				slug: 'residencial-cancel-maintenance',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const maintenance = await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: MaintenancePeriodicity.MONTH,
				title: 'Manutencao do elevador',
				description: 'Revisao mensal do elevador',
			},
		})

		maintenanceId = maintenance.id

		const session = await request(app.getHttpServer()).post('/v1/sessions').send({
			email: 'cancel-maintenance@example.com',
			password: '123456',
		})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[PATCH] /v1/condominium/:condominiumId/maintenances/:maintenanceId/cancel', async () => {
		const response = await request(app.getHttpServer())
			.patch(
				`/v1/condominium/${condominiumId}/maintenances/${maintenanceId}/cancel`,
			)
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({
			maintenance: expect.objectContaining({
				id: maintenanceId,
				canceledAt: expect.any(String),
			}),
		})

		const maintenanceOnDatabase = await prisma.maintenance.findUnique({
			where: {
				id: maintenanceId,
			},
		})

		expect(maintenanceOnDatabase?.canceledAt).toBeTruthy()
	})
})
