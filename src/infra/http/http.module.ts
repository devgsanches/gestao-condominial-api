import { Module } from '@nestjs/common'
import { CancelMaintenanceUseCase } from '@/domain/management/application/use-cases/cancel-maintenance'
import { CreateAddressUseCase } from '@/domain/management/application/use-cases/create-address'
import { CreateCondominiumUseCase } from '@/domain/management/application/use-cases/create-condominium'
import { CreateContractUseCase } from '@/domain/management/application/use-cases/create-contract'
import { CreateMaintenanceUseCase } from '@/domain/management/application/use-cases/create-maintenance'
import { DeleteCondominiumUseCase } from '@/domain/management/application/use-cases/delete-condominium'
import { FetchAppointmentsUseCase } from '@/domain/management/application/use-cases/fetch-appointments'
import { FetchCondominiumsByManagerUseCase } from '@/domain/management/application/use-cases/fetch-condominiums-by-manager'
import { FetchMaintenancesUseCase } from '@/domain/management/application/use-cases/fetch-maintenances'
import { GetCondominiumUseCase } from '@/domain/management/application/use-cases/get-condominium'
import { GetManagerProfileUseCase } from '@/domain/management/application/use-cases/get-manager-profile'
import { RegisterManagerUseCase } from '@/domain/management/application/use-cases/register-manager'
import { SignInManagerUseCase } from '@/domain/management/application/use-cases/sign-in-manager'
import { UpdateCondominiumUseCase } from '@/domain/management/application/use-cases/update-condominium'
import { UpdateMaintenanceUseCase } from '@/domain/management/application/use-cases/update-maintenance'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CancelMaintenanceController } from './controllers/cancel-maintenance.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateAddressController } from './controllers/create-address.controller'
import { CreateCondominiumController } from './controllers/create-condominium.controller'
import { CreateContractController } from './controllers/create-contract.controller'
import { CreateMaintenanceController } from './controllers/create-maintenance.controller'
import { DeleteCondominiumController } from './controllers/delete-condominium.controller'
import { FetchAppointmentsController } from './controllers/fetch-appointments.controller'
import { FetchCondominiumsController } from './controllers/fetch-condominiums.controller'
import { FetchMaintenancesController } from './controllers/fetch-maintenances.controller'
import { GetCondominiumController } from './controllers/get-condominium.controller'
import { GetManagerProfileController } from './controllers/get-manager-profile.controller'
import { HealthCheckController } from './controllers/health-check.controller'
import { UpdateCondominiumController } from './controllers/update-condominium.controller'
import { UpdateMaintenanceController } from './controllers/update-maintenance.controller'

@Module({
	imports: [DatabaseModule, CryptographyModule],
	controllers: [
		HealthCheckController,
		CreateAccountController,
		AuthenticateController,
		GetManagerProfileController,
		CreateAddressController,
		CreateCondominiumController,
		FetchCondominiumsController,
		GetCondominiumController,
		UpdateCondominiumController,
		DeleteCondominiumController,
		FetchMaintenancesController,
		FetchAppointmentsController,
		CreateMaintenanceController,
		CreateContractController,
		UpdateMaintenanceController,
		CancelMaintenanceController,
	],
	providers: [
		RegisterManagerUseCase,
		SignInManagerUseCase,
		GetManagerProfileUseCase,
		CreateAddressUseCase,
		CreateCondominiumUseCase,
		FetchCondominiumsByManagerUseCase,
		GetCondominiumUseCase,
		UpdateCondominiumUseCase,
		DeleteCondominiumUseCase,
		FetchMaintenancesUseCase,
		FetchAppointmentsUseCase,
		CreateMaintenanceUseCase,
		CreateContractUseCase,
		UpdateMaintenanceUseCase,
		CancelMaintenanceUseCase,
	],
})
export class HttpModule {}
