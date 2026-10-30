import { UserRole } from '@generated/prisma/enums'
import {
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { MailSender } from '@/domain/management/application/mail/mail-sender'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { FakeMailSender } from '@/test/mail/fake-mail-sender'

describe('First access (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let mailSender: FakeMailSender

	beforeAll(async () => {
		mailSender = new FakeMailSender()

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(MailSender)
			.useValue(mailSender)
			.compile()

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

		await prisma.user.create({
			data: {
				name: 'Síndico Primeiro Acesso',
				role: UserRole.CONDOMINIUM_MANAGER,
				email: 'first-access@example.com',
				password: await hash('temporary-password', 8),
			},
		})
	})

	afterAll(async () => {
		await app.close()
	})

	test('[POST] /v1/sessions/first-access unknown email', async () => {
		const response = await request(app.getHttpServer())
			.post('/v1/sessions/first-access')
			.send({ email: 'unknown@example.com' })

		expect(response.statusCode).toBe(202)
		expect(mailSender.firstAccessCodes).toHaveLength(0)
	})

	test('first access flow: request code, verify and set password', async () => {
		const requestResponse = await request(app.getHttpServer())
			.post('/v1/sessions/first-access')
			.send({ email: 'first-access@example.com' })

		expect(requestResponse.statusCode).toBe(202)
		expect(mailSender.firstAccessCodes).toHaveLength(1)

		const { code } = mailSender.firstAccessCodes[0]

		const authCodeOnDatabase = await prisma.authCode.findFirst({
			where: { email: 'first-access@example.com' },
		})

		expect(authCodeOnDatabase?.code).not.toBe(code)

		const wrongCode = code === '0000' ? '1111' : '0000'

		const wrongCodeResponse = await request(app.getHttpServer())
			.post('/v1/sessions/first-access/verify')
			.send({ email: 'first-access@example.com', code: wrongCode })

		expect(wrongCodeResponse.statusCode).toBe(401)

		const verifyResponse = await request(app.getHttpServer())
			.post('/v1/sessions/first-access/verify')
			.send({ email: 'first-access@example.com', code })

		expect(verifyResponse.statusCode).toBe(200)
		expect(verifyResponse.body).toEqual({
			access_token: expect.any(String),
		})

		const reusedCodeResponse = await request(app.getHttpServer())
			.post('/v1/sessions/first-access/verify')
			.send({ email: 'first-access@example.com', code })

		expect(reusedCodeResponse.statusCode).toBe(401)

		const passwordResponse = await request(app.getHttpServer())
			.patch('/v1/accounts/manager/password')
			.set('Authorization', `Bearer ${verifyResponse.body.access_token}`)
			.send({ password: 'nova-senha-123' })

		expect(passwordResponse.statusCode).toBe(204)

		const sessionResponse = await request(app.getHttpServer())
			.post('/v1/sessions')
			.send({ email: 'first-access@example.com', password: 'nova-senha-123' })

		expect(sessionResponse.body).toEqual({
			access_token: expect.any(String),
		})
	})

	test('[POST] /v1/sessions/first-access/verify invalid code format', async () => {
		const response = await request(app.getHttpServer())
			.post('/v1/sessions/first-access/verify')
			.send({ email: 'first-access@example.com', code: '12a' })

		expect(response.statusCode).toBe(400)
	})

	test('[PATCH] /v1/accounts/manager/password requires authentication', async () => {
		const response = await request(app.getHttpServer())
			.patch('/v1/accounts/manager/password')
			.send({ password: 'nova-senha-123' })

		expect(response.statusCode).toBe(401)
	})
})
