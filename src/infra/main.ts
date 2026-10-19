import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
	const port = process.env.PORT ?? 3333
	const app = await NestFactory.create(AppModule)

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

	await app.listen(port)
}
bootstrap()
