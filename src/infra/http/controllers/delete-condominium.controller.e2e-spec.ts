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

describe('Delete condominium (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string
	let addressId: string

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
				email: 'delete-condominium@example.com',
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
				name: 'Residencial Delete E2E',
				slug: 'residencial-delete-e2e',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id
		addressId = address.id

		const session = await request(app.getHttpServer()).post('/v1/sessions').send({
			email: 'delete-condominium@example.com',
			password: '123456',
		})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[DELETE] /v1/condominium/:condominiumId', async () => {
		const response = await request(app.getHttpServer())
			.delete(`/v1/condominium/${condominiumId}`)
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(204)

		const condominiumOnDatabase = await prisma.condominium.findUnique({
			where: {
				id: condominiumId,
			},
		})

		const addressOnDatabase = await prisma.address.findUnique({
			where: {
				id: addressId,
			},
		})

		expect(condominiumOnDatabase).toBeNull()
		expect(addressOnDatabase).toBeNull()
	})
})
