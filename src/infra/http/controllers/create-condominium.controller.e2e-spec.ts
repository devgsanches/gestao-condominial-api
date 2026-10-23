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

describe('Create condominium (E2E)', () => {
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

		await prisma.user.create({
			data: {
				name: 'John Doe',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'create-condominium@example.com',
				password: await hash('123456', 8),
			},
		})

		const session = await request(app.getHttpServer()).post('/v1/sessions').send({
			email: 'create-condominium@example.com',
			password: '123456',
		})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[POST] /v1/condominium', async () => {
		const addressResponse = await request(app.getHttpServer())
			.post('/v1/addresses')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				zipCode: '11060-001',
				street: 'Av. Ana Costa',
				number: 480,
				neighborhood: 'Gonzaga',
				city: 'Santos',
				state: 'SP',
				country: 'Brasil',
			})

		expect(addressResponse.statusCode).toBe(201)

		const addressId = addressResponse.body.address.id

		const response = await request(app.getHttpServer())
			.post('/v1/condominium')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				addressId,
				name: 'Condomínio E2E Create',
			})

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual({
			condominium: expect.objectContaining({
				id: expect.any(String),
				name: 'Condomínio E2E Create',
				slug: 'condominio-e2e-create',
				addressId,
			}),
		})

		const condominiumOnDatabase = await prisma.condominium.findUnique({
			where: {
				name: 'Condomínio E2E Create',
			},
		})

		expect(condominiumOnDatabase).toBeTruthy()
	})
})
