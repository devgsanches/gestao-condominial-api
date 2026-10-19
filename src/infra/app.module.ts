import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CreateCondominiumUseCase } from '@/domain/management/application/use-cases/create-condominium'
import { AuthModule } from './auth/auth.module'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { AuthenticateController } from './http/controllers/authenticate.controller'
import { CreateAccountController } from './http/controllers/create-account.controller'
import { CreateCondominiumController } from './http/controllers/create-condominium.controller'
import { HealthCheckController } from './http/controllers/health-check.controller'
import { PrismaService } from './prisma/prisma.service'

@Module({
	imports: [
		AuthModule,
		ConfigModule.forRoot({
			validate: (env) => envSchema.parse(env),
			isGlobal: true,
			envFilePath: '.env',
		}),
		EnvModule,
	],
	controllers: [
		HealthCheckController,
		CreateAccountController,
		AuthenticateController,
		CreateCondominiumController,
	],
	providers: [PrismaService, CreateCondominiumUseCase],
})
export class AppModule {}
