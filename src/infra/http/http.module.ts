import { Module } from '@nestjs/common'
import { AttachContractDocumentUseCase } from '@/domain/management/application/use-cases/attach-contract-document'
import { CancelAppointmentsUseCase } from '@/domain/management/application/use-cases/cancel-appointment'
import { CancelMaintenanceUseCase } from '@/domain/management/application/use-cases/cancel-maintenance'
import { CreateAddressUseCase } from '@/domain/management/application/use-cases/create-address'
import { CreateCondominiumUseCase } from '@/domain/management/application/use-cases/create-condominium'
import { CreateContractUseCase } from '@/domain/management/application/use-cases/create-contract'
import { CreateMaintenanceUseCase } from '@/domain/management/application/use-cases/create-maintenance'
import { CreateManagerAvatarUseCase } from '@/domain/management/application/use-cases/create-manager-avatar'
import { DeleteCondominiumUseCase } from '@/domain/management/application/use-cases/delete-condominium'
import { FetchAppointmentsUseCase } from '@/domain/management/application/use-cases/fetch-appointments'
import { FetchCondominiumsByManagerUseCase } from '@/domain/management/application/use-cases/fetch-condominiums-by-manager'
import { FetchMaintenancesUseCase } from '@/domain/management/application/use-cases/fetch-maintenances'
import { GetCondominiumUseCase } from '@/domain/management/application/use-cases/get-condominium'
import { GetManagerProfileUseCase } from '@/domain/management/application/use-cases/get-manager-profile'
import { RegisterManagerUseCase } from '@/domain/management/application/use-cases/register-manager'
import { ScheduleMeetingUseCase } from '@/domain/management/application/use-cases/schedule-meeting'
import { SignInManagerUseCase } from '@/domain/management/application/use-cases/sign-in-manager'
import { UpdateCondominiumUseCase } from '@/domain/management/application/use-cases/update-condominium'
import { UpdateMaintenanceUseCase } from '@/domain/management/application/use-cases/update-maintenance'
import { UploadAndCreateAttachmentUseCase } from '@/domain/management/application/use-cases/upload-and-create-attachment'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { StorageModule } from '../storage/storage.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CancelAppointmentController } from './controllers/cancel-appointment.controller'
import { CancelMaintenanceController } from './controllers/cancel-maintenance.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { CreateAddressController } from './controllers/create-address.controller'
import { CreateCondominiumController } from './controllers/create-condominium.controller'
import { CreateContractController } from './controllers/create-contract.controller'
import { CreateContractAttachmentController } from './controllers/create-contract-attachment.controller'
import { CreateMaintenanceController } from './controllers/create-maintenance.controller'
import { CreateManagerAvatarController } from './controllers/create-manager-avatar.controller'
import { DeleteCondominiumController } from './controllers/delete-condominium.controller'
import { FetchAppointmentsController } from './controllers/fetch-appointments.controller'
import { FetchCondominiumsController } from './controllers/fetch-condominiums.controller'
import { FetchMaintenancesController } from './controllers/fetch-maintenances.controller'
import { GetCondominiumController } from './controllers/get-condominium.controller'
import { GetManagerProfileController } from './controllers/get-manager-profile.controller'
import { HealthCheckController } from './controllers/health-check.controller'
import { ScheduleController } from './controllers/schedule.controller'
import { UpdateCondominiumController } from './controllers/update-condominium.controller'
import { UpdateMaintenanceController } from './controllers/update-maintenance.controller'
import { UploadAttachmentController } from './controllers/upload-attachment.controller'

@Module({
	imports: [DatabaseModule, CryptographyModule, StorageModule],
	controllers: [
		HealthCheckController,
		CreateAccountController,
		AuthenticateController,
		GetManagerProfileController,
		CreateManagerAvatarController,
		CreateAddressController,
		CreateCondominiumController,
		FetchCondominiumsController,
		GetCondominiumController,
		UpdateCondominiumController,
		DeleteCondominiumController,
		FetchMaintenancesController,
		FetchAppointmentsController,
		ScheduleController,
		CreateMaintenanceController,
		CreateContractController,
		UploadAttachmentController,
		CreateContractAttachmentController,
		UpdateMaintenanceController,
		CancelMaintenanceController,
		CancelAppointmentController,
	],
	providers: [
		RegisterManagerUseCase,
		SignInManagerUseCase,
		GetManagerProfileUseCase,
		CreateManagerAvatarUseCase,
		CreateAddressUseCase,
		CreateCondominiumUseCase,
		FetchCondominiumsByManagerUseCase,
		GetCondominiumUseCase,
		UpdateCondominiumUseCase,
		DeleteCondominiumUseCase,
		FetchMaintenancesUseCase,
		FetchAppointmentsUseCase,
		ScheduleMeetingUseCase,
		CreateMaintenanceUseCase,
		CreateContractUseCase,
		UpdateMaintenanceUseCase,
		CancelMaintenanceUseCase,
		CancelAppointmentsUseCase,
		UploadAndCreateAttachmentUseCase,
		AttachContractDocumentUseCase,
	],
})
export class HttpModule {}
