import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'

describe('Create account (E2E)', () => {
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

	test('[POST] /v1/accounts', async () => {
		const response = await request(app.getHttpServer())
			.post('/v1/accounts')
			.send({
				name: 'John Doe',
				email: 'johndoe@example.com',
				password: '123456',
			})

		expect(response.statusCode).toBe(201)

		const userOnDatabase = await prisma.user.findUnique({
			where: {
				email: 'johndoe@example.com',
			},
		})

		expect(userOnDatabase).toBeTruthy()
	})
})
