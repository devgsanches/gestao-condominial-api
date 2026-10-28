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

		await prisma.condominium.create({
			data: {
				name: 'Residencial Profile',
				slug: 'residencial-profile',
				managerId: manager.id,
				addressId: address.id,
			},
		})

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
			manager: expect.objectContaining({
				name: 'John Doe',
				email: 'get-manager-profile@example.com',
				condominiums: expect.arrayContaining([
					expect.objectContaining({
						name: 'Residencial Profile',
						address: expect.objectContaining({
							city: 'Santos',
						}),
					}),
				]),
			}),
		})
	})
})
