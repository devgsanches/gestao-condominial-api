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

describe('Link admin to condominium (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let managerAccessToken: string
	let adminAccessToken: string
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
				email: 'link-admin-manager@example.com',
				password: await hash('123456', 8),
			},
		})

		await prisma.user.create({
			data: {
				name: 'Ana Admin',
				role: UserRole.CONDOMINIUM_ADMIN,
				email: 'link-admin-admin@example.com',
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
				name: 'Residencial Link Admin',
				slug: 'residencial-link-admin',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const managerSession = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'link-admin-manager@example.com',
				password: '123456',
			})

		managerAccessToken = managerSession.body.access_token

		const adminSession = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'link-admin-admin@example.com',
				password: '123456',
			})

		adminAccessToken = adminSession.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/condominium lists nothing for an unlinked admin', async () => {
		const response = await request(app.getHttpServer())
			.get('/v1/condominium')
			.set('Authorization', `Bearer ${adminAccessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.condominiums).toHaveLength(0)
	})

	test('[POST] /v1/condominium/:condominiumId/admins', async () => {
		const response = await request(app.getHttpServer())
			.post(`/v1/condominium/${condominiumId}/admins`)
			.set('Authorization', `Bearer ${managerAccessToken}`)
			.send({ email: 'link-admin-admin@example.com' })

		expect(response.statusCode).toBe(204)
	})

	test('[POST] /v1/condominium/:condominiumId/admins twice returns 409', async () => {
		const response = await request(app.getHttpServer())
			.post(`/v1/condominium/${condominiumId}/admins`)
			.set('Authorization', `Bearer ${managerAccessToken}`)
			.send({ email: 'link-admin-admin@example.com' })

		expect(response.statusCode).toBe(409)
	})

	test('[POST] /v1/condominium/:condominiumId/admins by an admin returns 401', async () => {
		const response = await request(app.getHttpServer())
			.post(`/v1/condominium/${condominiumId}/admins`)
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.send({ email: 'link-admin-admin@example.com' })

		expect(response.statusCode).toBe(401)
	})

	test('[GET] /v1/condominium lists the linked condominium for the admin', async () => {
		const response = await request(app.getHttpServer())
			.get('/v1/condominium')
			.set('Authorization', `Bearer ${adminAccessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.condominiums).toEqual([
			expect.objectContaining({
				id: condominiumId,
				name: 'Residencial Link Admin',
			}),
		])
	})
})
