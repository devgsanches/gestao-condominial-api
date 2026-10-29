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

describe('Create maintenance (E2E)', () => {
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
				email: 'create-maintenance@example.com',
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
				name: 'Residencial Create Maintenance',
				slug: 'residencial-create-maintenance',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'create-maintenance@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[POST] /v1/condominium/:condominiumId/maintenances general', async () => {
		const response = await request(app.getHttpServer())
			.post(`/v1/condominium/${condominiumId}/maintenances`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				title: 'Troca de lampadas',
				description: 'Substituicao das lampadas do hall',
			})

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual({
			maintenance: expect.objectContaining({
				id: expect.any(String),
				condominiumId,
				title: 'Troca de lampadas',
				description: 'Substituicao das lampadas do hall',
				type: 'GENERAL',
				periodicity: null,
			}),
		})

		const maintenanceOnDatabase = await prisma.maintenance.findFirst({
			where: {
				title: 'Troca de lampadas',
				condominiumId,
			},
		})

		expect(maintenanceOnDatabase).toBeTruthy()
	})

	test('[POST] /v1/condominium/:condominiumId/maintenances periodic', async () => {
		const response = await request(app.getHttpServer())
			.post(`/v1/condominium/${condominiumId}/maintenances`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				title: 'Manutencao do elevador',
				description: 'Revisao mensal do elevador social e de servico',
				type: 'PERIODIC',
				periodicity: 'month',
			})

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual({
			maintenance: expect.objectContaining({
				id: expect.any(String),
				condominiumId,
				title: 'Manutencao do elevador',
				description: 'Revisao mensal do elevador social e de servico',
				type: 'PERIODIC',
				periodicity: 'month',
			}),
		})

		const maintenanceOnDatabase = await prisma.maintenance.findFirst({
			where: {
				title: 'Manutencao do elevador',
				condominiumId,
			},
		})

		expect(maintenanceOnDatabase).toBeTruthy()
		expect(maintenanceOnDatabase?.type).toBe('PERIODIC')
		expect(maintenanceOnDatabase?.periodicity).toBe('MONTH')
	})
})
