import {
	AppointmentType,
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

function daysFromNow(days: number) {
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date
}

describe('Get condominium (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let accessToken: string
	let condominiumId: string
	let nextMeetingId: string
	let periodicWithoutContractId: string

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

		const user = await prisma.user.create({
			data: {
				name: 'Jane Doe',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'get-condominium@example.com',
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
				name: 'Residencial Vila Nova E2E',
				slug: 'residencial-vila-nova-e2e',
				unitsCount: 120,
				managerId: user.id,
				addressId: address.id,
			},
		})

		condominiumId = condominium.id

		await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.GENERAL,
				title: 'Troca de lâmpadas',
				description: 'Manutenção geral ativa',
			},
		})

		const periodicWithContract = await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: MaintenancePeriodicity.MONTH,
				title: 'Elevador',
				description: 'Manutenção periódica com contrato',
			},
		})

		const periodicWithoutContract = await prisma.maintenance.create({
			data: {
				condominiumId: condominium.id,
				type: MaintenanceType.PERIODIC,
				periodicity: MaintenancePeriodicity.SEMESTER,
				title: "Limpeza da caixa d'água",
				description: 'Manutenção periódica sem contrato',
			},
		})

		periodicWithoutContractId = periodicWithoutContract.id

		await prisma.contract.create({
			data: {
				maintenanceId: periodicWithContract.id,
				title: 'Contrato do elevador',
				slug: 'contrato-do-elevador',
				description: 'Contrato vigente',
				supplierName: 'Elevadores Atlas',
				supplierCnpj: '12345678000190',
				valueInCents: 150000,
				startVigencyDate: new Date(),
				endVigencyDate: daysFromNow(365),
			},
		})

		const nextMeeting = await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.MEETING,
				title: 'Vistoria com a construtora',
				description: 'Reunião futura',
				location: 'Salão de festas',
				scheduledAt: daysFromNow(6),
			},
		})

		nextMeetingId = nextMeeting.id

		await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.ASSEMBLY,
				title: 'Assembleia ordinária',
				description: 'Assembleia futura',
				scheduledAt: daysFromNow(20),
			},
		})

		await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.MEETING,
				title: 'Reunião cancelada',
				description: 'Não deve entrar no total',
				scheduledAt: daysFromNow(3),
				canceledAt: new Date(),
			},
		})

		await prisma.appointment.create({
			data: {
				condominiumId: condominium.id,
				type: AppointmentType.MEETING,
				title: 'Reunião passada',
				description: 'Não deve entrar no total',
				scheduledAt: daysFromNow(-2),
			},
		})

		const session = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({
				email: 'get-condominium@example.com',
				password: '123456',
			})

		accessToken = session.body.access_token
	})

	afterAll(async () => {
		await app.close()
	})

	test('[GET] /v1/condominium/:condominiumId', async () => {
		const response = await request(app.getHttpServer())
			.get(`/v1/condominium/${condominiumId}`)
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({
			condominium: {
				id: condominiumId,
				name: 'Residencial Vila Nova E2E',
				unitsCount: 120,
			},
			address: {
				zipCode: '11060-001',
				street: 'Av. Ana Costa',
				number: 480,
				complement: null,
				neighborhood: 'Gonzaga',
				city: 'Santos',
				state: 'SP',
				country: 'Brasil',
			},
			activeMaintenancesCount: 3,
			periodicWithoutContractCount: 1,
			validContractsCount: 1,
			scheduledAppointmentsCount: 2,
			nextAppointment: {
				id: nextMeetingId,
				type: 'meeting',
				title: 'Vistoria com a construtora',
				location: 'Salão de festas',
				scheduledAt: expect.any(String),
			},
			periodicWithoutContract: [
				{
					id: periodicWithoutContractId,
					title: "Limpeza da caixa d'água",
					periodicity: 'semester',
				},
			],
		})

		expect(response.body.generalMaintenances).toBeUndefined()
		expect(response.body.periodicMaintenances).toBeUndefined()
		expect(response.body.contract).toBeUndefined()
	})
})
