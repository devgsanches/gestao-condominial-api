import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'
import { MAIL_QUEUE } from './mail/mail.constants'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const configService = app.get(EnvService)
	const port = configService.get('PORT') ?? 3333

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

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [configService.get('RABBITMQ_URL')],
			queue: MAIL_QUEUE,
			queueOptions: { durable: true },
		},
	})

	await app.startAllMicroservices()

	await app.listen(port)
}
bootstrap()
