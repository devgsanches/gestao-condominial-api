import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'

describe('Authenticate (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService

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
	})

	afterAll(async () => {
		await app.close()
	})

	test('[POST] /v1/sessions', async () => {
		await prisma.user.create({
			data: {
				name: 'John Doe',
				role: 'MANAGER',
				email: 'johndoe@example.com',
				password: await hash('123456', 8),
			},
		})

		const response = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'johndoe@example.com',
				password: '123456',
			})

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual({
			access_token: expect.any(String),
		})
	})
})
