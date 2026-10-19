import { Module } from '@nestjs/common'
import { CreateCondominiumUseCase } from '@/domain/management/application/use-cases/create-condominium'
import { PrismaService } from '../prisma/prisma.service'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateCondominiumController } from './controllers/create-condominium.controller'
import { HealthCheckController } from './controllers/health-check.controller'

@Module({
	controllers: [
		HealthCheckController,
		CreateAccountController,
		AuthenticateController,
		CreateCondominiumController,
	],
	providers: [PrismaService, CreateCondominiumUseCase],
})
export class HttpModule {}
