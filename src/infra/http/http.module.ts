import { Module } from '@nestjs/common'
import { CreateCondominiumUseCase } from '@/domain/management/application/use-cases/create-condominium'
import { RegisterManagerUseCase } from '@/domain/management/application/use-cases/register-manager'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateCondominiumController } from './controllers/create-condominium.controller'
import { HealthCheckController } from './controllers/health-check.controller'

@Module({
	imports: [DatabaseModule],
	controllers: [
		HealthCheckController,
		CreateAccountController,
		AuthenticateController,
		CreateCondominiumController,
	],
	providers: [CreateCondominiumUseCase, RegisterManagerUseCase],
})
export class HttpModule {}
