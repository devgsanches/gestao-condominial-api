import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { HealthCheckController } from './controllers/health-check.controller'
import { PrismaService } from './prisma/prisma.service'
import { CreateCondominiumUseCase } from './domain/management/application/use-cases/create-condominium'
import { CreateCondominiumController } from './controllers/create-condominium.controller'

@Module({
	imports: [
		AuthModule,
		ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
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
