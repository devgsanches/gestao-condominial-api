import {
	MaintenancePeriodicity,
	MaintenanceType,
	UserRole,
} from '@generated/prisma/enums'
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

describe('Create contract (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string
	let periodicMaintenanceId: string
	let generalMaintenanceId: string

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
				email: 'create-contract@example.com',
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
				name: 'Residencial Create Contract',
				slug: 'residencial-create-contract',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const periodicMaintenance = await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: MaintenancePeriodicity.MONTH,
				title: 'Manutencao do elevador',
				description: 'Revisao mensal do elevador',
			},
		})

		periodicMaintenanceId = periodicMaintenance.id

		const generalMaintenance = await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.GENERAL,
				title: 'Troca de lampadas',
				description: 'Manutencao geral',
			},
		})

		generalMaintenanceId = generalMaintenance.id

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'create-contract@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[POST] /v1/condominium/:condominiumId/maintenances/:maintenanceId/contracts', async () => {
		const response = await request(app.getHttpServer())
			.post(
				`/v1/condominium/${condominiumId}/maintenances/${periodicMaintenanceId}/contracts`,
			)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				title: 'Contrato de manutencao do elevador',
				description: 'Contrato anual de manutencao preventiva',
				startVigencyDate: '2026-01-01T00:00:00.000Z',
				endVigencyDate: '2026-12-31T23:59:59.000Z',
			})

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual({
			contract: expect.objectContaining({
				id: expect.any(String),
				maintenanceId: periodicMaintenanceId,
				title: 'Contrato de manutencao do elevador',
				slug: 'contrato-de-manutencao-do-elevador',
				description: 'Contrato anual de manutencao preventiva',
				isValid: true,
				startVigencyDate: '2026-01-01T00:00:00.000Z',
				endVigencyDate: '2026-12-31T23:59:59.000Z',
			}),
		})

		const contractOnDatabase = await prisma.contract.findUnique({
			where: {
				maintenanceId: periodicMaintenanceId,
			},
		})

		expect(contractOnDatabase).toBeTruthy()
	})

	test('[POST] /v1/condominium/:condominiumId/maintenances/:maintenanceId/contracts general maintenance', async () => {
		const response = await request(app.getHttpServer())
			.post(
				`/v1/condominium/${condominiumId}/maintenances/${generalMaintenanceId}/contracts`,
			)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				title: 'Contrato invalido',
				description: 'Contrato nao deve ser criado para manutencao geral',
				startVigencyDate: '2026-01-01T00:00:00.000Z',
				endVigencyDate: '2026-12-31T23:59:59.000Z',
			})

		expect(response.statusCode).toBe(400)
	})
})
