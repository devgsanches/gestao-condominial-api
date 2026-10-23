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

describe('Fetch condominiums (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let firstCondominiumId: string
	let secondCondominiumId: string

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
				email: 'fetch-condominiums@example.com',
				password: await hash('123456', 8),
			},
		})

		const otherManager = await prisma.user.create({
			data: {
				name: 'Jane Doe',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'fetch-condominiums-other@example.com',
				password: await hash('123456', 8),
			},
		})

		const firstAddress = await prisma.address.create({
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

		const secondAddress = await prisma.address.create({
			data: {
				zipCode: '11010-001',
				street: 'Rua do Comercio',
				number: 120,
				neighborhood: 'Centro',
				city: 'Santos',
				state: 'SP',
				country: 'Brasil',
			},
		})

		const otherAddress = await prisma.address.create({
			data: {
				zipCode: '11075-200',
				street: 'Av. Conselheiro Nebias',
				number: 300,
				neighborhood: 'Boqueirao',
				city: 'Santos',
				state: 'SP',
				country: 'Brasil',
			},
		})

		const firstCondominium = await prisma.condominium.create({
			data: {
				name: 'Residencial Fetch One',
				slug: 'residencial-fetch-one',
				managerId: manager.id,
				addressId: firstAddress.id,
			},
		})

		const secondCondominium = await prisma.condominium.create({
			data: {
				name: 'Residencial Fetch Two',
				slug: 'residencial-fetch-two',
				managerId: manager.id,
				addressId: secondAddress.id,
			},
		})

		await prisma.condominium.create({
			data: {
				name: 'Residencial Fetch Other',
				slug: 'residencial-fetch-other',
				managerId: otherManager.id,
				addressId: otherAddress.id,
			},
		})

		firstCondominiumId = firstCondominium.id
		secondCondominiumId = secondCondominium.id

		const session = await request(app.getHttpServer()).post('/v1/sessions').send({
			email: 'fetch-condominiums@example.com',
			password: '123456',
		})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/condominium', async () => {
		const response = await request(app.getHttpServer())
			.get('/v1/condominium')
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body.condominiums).toHaveLength(2)
		expect(response.body.condominiums).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: firstCondominiumId,
					name: 'Residencial Fetch One',
					slug: 'residencial-fetch-one',
				}),
				expect.objectContaining({
					id: secondCondominiumId,
					name: 'Residencial Fetch Two',
					slug: 'residencial-fetch-two',
				}),
			]),
		)
		expect(response.body.condominiums).not.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'Residencial Fetch Other',
				}),
			]),
		)
	})
})
