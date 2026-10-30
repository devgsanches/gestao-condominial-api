import { UserRole } from '@generated/prisma/enums'
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

describe('Fetch condominium dashboard (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let otherAccessToken: string
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

		const password = await hash('123456', 8)

		const manager = await prisma.user.create({
			data: {
				name: 'Dashboard Owner',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'dashboard-owner@example.com',
				password,
			},
		})

		await prisma.user.create({
			data: {
				name: 'Dashboard Intruder',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'dashboard-intruder@example.com',
				password,
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
				name: 'Residencial Dashboard',
				slug: 'residencial-dashboard',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const [session, otherSession] = await Promise.all([
			request(app.getHttpServer())
				.post('/v1/sessions')
				.send({ email: 'dashboard-owner@example.com', password: '123456' }),
			request(app.getHttpServer())
				.post('/v1/sessions')
				.send({ email: 'dashboard-intruder@example.com', password: '123456' }),
		])

		accessToken = session.body.access_token
		otherAccessToken = otherSession.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/condominium/:condominiumId/dashboard', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/dashboard`)
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body).toMatchObject({
			condominiumName: 'Residencial Dashboard',
		})
	})

	test('[GET] /v1/condominium/:condominiumId/dashboard from another manager', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/dashboard`)
			.set('Authorization', `Bearer ${otherAccessToken}`)

		expect(response.statusCode).toBe(401)
	})
})
