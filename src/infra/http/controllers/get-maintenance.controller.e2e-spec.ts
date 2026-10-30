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

describe('Get maintenance (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string
	let maintenanceId: string
	let contractId: string
	let attachmentId: string

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
				email: 'get-maintenance@example.com',
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
				name: 'Residencial Get Maintenance',
				slug: 'residencial-get-maintenance',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		const maintenance = await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: MaintenancePeriodicity.MONTH,
				title: 'Manutencao do elevador',
				description: 'Revisao mensal do elevador',
				scheduledAt: new Date('2026-01-01T00:00:00.000Z'),
			},
		})

		maintenanceId = maintenance.id

		const contract = await prisma.contract.create({
			data: {
				maintenanceId: maintenance.id,
				slug: 'atlas-elevadores-get-maintenance',
				supplierName: 'Atlas Elevadores Ltda.',
				supplierCnpj: '12345678000190',
				valueInCents: 125000,
				startVigencyDate: new Date('2026-01-01T00:00:00.000Z'),
				endVigencyDate: new Date('2026-12-31T23:59:59.000Z'),
			},
		})

		contractId = contract.id

		const attachment = await prisma.attachment.create({
			data: {
				title: 'contrato_assinado.pdf',
				url: 'contrato-assinado.pdf',
			},
		})

		attachmentId = attachment.id

		await prisma.contractAttachment.create({
			data: {
				contractId: contract.id,
				attachmentId: attachment.id,
			},
		})

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'get-maintenance@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/condominium/:condominiumId/maintenances/:maintenanceId', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}/maintenances/${maintenanceId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send()

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({
			maintenance: expect.objectContaining({
				id: maintenanceId,
				type: MaintenanceType.PERIODIC,
				periodicity: 'month',
				title: 'Manutencao do elevador',
				description: 'Revisao mensal do elevador',
				scheduledAt: '2026-01-01T00:00:00.000Z',
				contract: expect.objectContaining({
					id: contractId,
					supplierName: 'Atlas Elevadores Ltda.',
					supplierCnpj: '12345678000190',
					valueInCents: 125000,
					status: 'valid',
					attachments: [
						expect.objectContaining({
							id: attachmentId,
							title: 'contrato_assinado.pdf',
							url: 'contrato-assinado.pdf',
						}),
					],
				}),
			}),
		})
	})

	test('[GET] /v1/condominium/:condominiumId/maintenances/:maintenanceId not found', async () => {
		const response = await request(app.getHttpServer())
			.get(
				`/v1/condominium/${condominiumId}/maintenances/00000000-0000-0000-0000-000000000000`,
			)
			.set('Authorization', `Bearer ${accessToken}`)
			.send()

		expect(response.statusCode).toBe(404)
	})
})
