import { UserRole } from '@generated/prisma/enums'
import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

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
		expect(response.body.role).toBe(UserRole.CONDOMINIUM_MANAGER)

		const userOnDatabase = await prisma.user.findUnique({
			where: {
				email: 'johndoe@example.com',
			},
		})

		expect(userOnDatabase).toBeTruthy()
		expect(userOnDatabase?.role).toBe(UserRole.CONDOMINIUM_MANAGER)
	})

	test('[POST] /v1/accounts as condominium admin', async () => {
		const response = await request(app.getHttpServer())
			.post('/v1/accounts')
			.send({
				name: 'Ana Admin',
				email: 'ana-admin@example.com',
				password: '123456',
				role: UserRole.CONDOMINIUM_ADMIN,
			})

		expect(response.statusCode).toBe(201)
		expect(response.body.role).toBe(UserRole.CONDOMINIUM_ADMIN)

		const userOnDatabase = await prisma.user.findUnique({
			where: {
				email: 'ana-admin@example.com',
			},
		})

		expect(userOnDatabase?.role).toBe(UserRole.CONDOMINIUM_ADMIN)
	})
})
