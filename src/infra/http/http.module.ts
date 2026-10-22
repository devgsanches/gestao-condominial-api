import { Module } from '@nestjs/common'
import { CreateAddressUseCase } from '@/domain/management/application/use-cases/create-address'
import { CreateCondominiumUseCase } from '@/domain/management/application/use-cases/create-condominium'
import { GetManagerProfileUseCase } from '@/domain/management/application/use-cases/get-manager-profile'
import { RegisterManagerUseCase } from '@/domain/management/application/use-cases/register-manager'
import { SignInManagerUseCase } from '@/domain/management/application/use-cases/sign-in-manager'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateAddressController } from './controllers/create-address.controller'
import { CreateCondominiumController } from './controllers/create-condominium.controller'
import { GetManagerProfileController } from './controllers/get-manager-profile.controller'
import { HealthCheckController } from './controllers/health-check.controller'

@Module({
	imports: [DatabaseModule, CryptographyModule],
	controllers: [
		HealthCheckController,
		CreateAccountController,
		AuthenticateController,
		GetManagerProfileController,
		CreateAddressController,
		CreateCondominiumController,
	],
	providers: [
		RegisterManagerUseCase,
		SignInManagerUseCase,
		GetManagerProfileUseCase,
		CreateAddressUseCase,
		CreateCondominiumUseCase,
	],
})
export class HttpModule {}
