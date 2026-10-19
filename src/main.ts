import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
	const port = process.env.PORT ?? 3333
	const app = await NestFactory.create(AppModule)
	
	app.enableVersioning({
    type: VersioningType.URI,
  })

	await app.listen(process.env.PORT ?? port)
}
bootstrap()
