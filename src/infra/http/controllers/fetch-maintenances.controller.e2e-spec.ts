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

describe('Fetch maintenances (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string
	let elevatorMaintenanceId: string

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
				email: 'fetch-maintenances@example.com',
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
				name: 'Residencial Fetch Maintenances',
				slug: 'residencial-fetch-maintenances',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.GENERAL,
				title: 'Troca de lampadas',
				description: 'Manutencao geral',
			},
		})

		const elevator = await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: MaintenancePeriodicity.MONTH,
				title: 'Manutencao do elevador',
				description: 'Revisao mensal do elevador',
			},
		})

		elevatorMaintenanceId = elevator.id

		await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: MaintenancePeriodicity.SEMESTER,
				title: "Limpeza da caixa d'agua",
				description: 'Manutencao periodica semestral',
			},
		})

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'fetch-maintenances@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/condominium/:condominiumId/maintenances', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/maintenances`)
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.maintenances).toHaveLength(3)
	})

	test('[GET] /v1/condominium/:condominiumId/maintenances?type=PERIODIC', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/maintenances`)
			.query({ type: 'PERIODIC' })
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.maintenances).toHaveLength(2)
		expect(
			response.body.maintenances.every(
				(maintenance: { type: string }) => maintenance.type === 'PERIODIC',
			),
		).toBe(true)
	})

	test('[GET] /v1/condominium/:condominiumId/maintenances?title=elevador', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/maintenances`)
			.query({ title: 'elevador' })
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.maintenances).toHaveLength(1)
		expect(response.body.maintenances[0]).toEqual(
			expect.objectContaining({
				id: elevatorMaintenanceId,
				title: 'Manutencao do elevador',
			}),
		)
	})
})
