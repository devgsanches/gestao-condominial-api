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

describe('Update condominium (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
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
				email: 'update-condominium@example.com',
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
				name: 'Residencial Update Original',
				slug: 'residencial-update-original',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'update-condominium@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[PATCH] /v1/condominium/:condominiumId', async () => {
		const response = await request(app.getHttpServer())
			.patch(`/v1/condominium/${condominiumId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: 'Residencial Update Atualizado',
				unitsCount: 64,
			})

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({
			condominium: expect.objectContaining({
				id: condominiumId,
				name: 'Residencial Update Atualizado',
				unitsCount: 64,
			}),
		})

		const condominiumOnDatabase = await prisma.condominium.findUnique({
			where: {
				id: condominiumId,
			},
		})

		expect(condominiumOnDatabase?.name).toBe('Residencial Update Atualizado')
		expect(condominiumOnDatabase?.unitsCount).toBe(64)
	})
})
