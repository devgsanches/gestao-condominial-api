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

describe('Get manager profile (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let managerId: string

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
				email: 'get-manager-profile@example.com',
				password: await hash('123456', 8),
			},
		})

		managerId = manager.id

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'get-manager-profile@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/accounts/manager/profile', async () => {
		const response = await request(app.getHttpServer())
			.get('/v1/accounts/manager/profile')
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({
			managerId,
			name: 'John Doe',
			email: 'get-manager-profile@example.com',
			role: UserRole.CONDOMINIUM_MANAGER,
			avatarUrl: null,
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		})
		expect(response.body).not.toHaveProperty('condominiums')
	})

	test('[GET] /v1/accounts/manager/profile as condominium admin', async () => {
		const admin = await prisma.user.create({
			data: {
				name: 'Ana Admin',
				role: UserRole.CONDOMINIUM_ADMIN,
				email: 'get-admin-profile@example.com',
				password: await hash('123456', 8),
			},
		})

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'get-admin-profile@example.com',
				password: '123456',
			})

		const response = await request(app.getHttpServer())
			.get('/v1/accounts/manager/profile')
			.set('Authorization', `Bearer ${session.body.access_token}`)

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({
			managerId: admin.id,
			name: 'Ana Admin',
			email: 'get-admin-profile@example.com',
			role: UserRole.CONDOMINIUM_ADMIN,
			avatarUrl: null,
			createdAt: expect.any(String),
			updatedAt: expect.any(String),
		})
	})
})
