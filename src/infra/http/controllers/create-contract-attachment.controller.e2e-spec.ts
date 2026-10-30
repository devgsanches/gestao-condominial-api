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

describe('Create contract attachment (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let otherAccessToken: string
	let contractId: string
	let firstAttachmentId: string
	let secondAttachmentId: string

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

		const password = await hash('123456', 8)

		const manager = await prisma.user.create({
			data: {
				name: 'Contract Owner',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'contract-attachment-owner@example.com',
				password,
			},
		})

		await prisma.user.create({
			data: {
				name: 'Contract Intruder',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'contract-attachment-intruder@example.com',
				password,
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
				name: 'Residencial Anexos',
				slug: 'residencial-anexos',
				managerId: manager.id,
				addressId: address.id,
			},
		})

		const maintenance = await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: MaintenancePeriodicity.MONTH,
				title: 'Elevador',
				description: 'Manutenção do elevador',
			},
		})

		const contract = await prisma.contract.create({
			data: {
				maintenanceId: maintenance.id,
				slug: 'contrato-elevador-anexos',
				supplierName: 'Elevadores Atlas',
				supplierCnpj: '12345678000190',
				valueInCents: 150000,
				startVigencyDate: new Date(),
				endVigencyDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
			},
		})

		contractId = contract.id

		const [firstAttachment, secondAttachment] = await Promise.all([
			prisma.attachment.create({
				data: { title: 'contrato.pdf', url: 'contracts/contrato.pdf' },
			}),
			prisma.attachment.create({
				data: { title: 'aditivo.pdf', url: 'contracts/aditivo.pdf' },
			}),
		])

		firstAttachmentId = firstAttachment.id
		secondAttachmentId = secondAttachment.id

		const [session, otherSession] = await Promise.all([
			request(app.getHttpServer()).post('/v1/sessions').send({
				email: 'contract-attachment-owner@example.com',
				password: '123456',
			}),
			request(app.getHttpServer()).post('/v1/sessions').send({
				email: 'contract-attachment-intruder@example.com',
				password: '123456',
			}),
		])

		accessToken = session.body.access_token
		otherAccessToken = otherSession.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[POST] /v1/contracts/:contractId/attachments from another manager', async () => {
		const response = await request(app.getHttpServer())
			.post(`/v1/contracts/${contractId}/attachments`)
			.set('Authorization', `Bearer ${otherAccessToken}`)
			.send({ attachmentsIds: [firstAttachmentId] })

		expect(response.statusCode).toBe(401)
		expect(
			await prisma.contractAttachment.count({ where: { contractId } }),
		).toBe(0)
	})

	test('[POST] /v1/contracts/:contractId/attachments', async () => {
		const firstResponse = await request(app.getHttpServer())
			.post(`/v1/contracts/${contractId}/attachments`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ attachmentsIds: [firstAttachmentId] })

		expect(firstResponse.statusCode).toBe(201)

		const response = await request(app.getHttpServer())
			.post(`/v1/contracts/${contractId}/attachments`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ attachmentsIds: [secondAttachmentId] })

		expect(response.statusCode).toBe(201)
		expect(response.body.contract).toMatchObject({
			id: contractId,
			supplierName: 'Elevadores Atlas',
			attachments: [
				{
					id: firstAttachmentId,
					title: 'contrato.pdf',
					url: 'contracts/contrato.pdf',
					createdAt: expect.any(String),
				},
				{
					id: secondAttachmentId,
					title: 'aditivo.pdf',
					url: 'contracts/aditivo.pdf',
					createdAt: expect.any(String),
				},
			],
		})
		expect(
			await prisma.contractAttachment.count({ where: { contractId } }),
		).toBe(2)
	})
})
