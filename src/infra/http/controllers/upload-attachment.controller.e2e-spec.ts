import { resolve } from 'node:path'
import { INestApplication, VersioningType } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { ManagerFactory } from '@/test/factories/make-manager'

describe('Upload attachment (E2E)', () => {
	let app: INestApplication
	let managerFactory: ManagerFactory
	let jwt: JwtService

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [ManagerFactory],
		}).compile()

		app = moduleRef.createNestApplication()

		app.enableVersioning({
			type: VersioningType.URI,
		})

		managerFactory = moduleRef.get(ManagerFactory)
		jwt = moduleRef.get(JwtService)

		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	test('[POST] /v1/attachments', async () => {
		const manager = await managerFactory.makePrismaManager()
		const accessToken = jwt.sign({ sub: manager.id.toString() })

		const response = await request(app.getHttpServer())
			.post('/v1/attachments')
			.set('Authorization', `Bearer ${accessToken}`)
			.attach('file', resolve(process.cwd(), 'test/e2e/sample-upload.png'))

		expect(response.statusCode).toBe(201)
	})
})
