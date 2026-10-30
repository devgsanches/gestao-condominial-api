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
import { FetchCondominiumDashboardUseCase } from '@/domain/management/application/use-cases/fetch-condominium-dashboard'
import { FetchCondominiumsByManagerUseCase } from '@/domain/management/application/use-cases/fetch-condominiums-by-manager'
import { FetchMaintenancesUseCase } from '@/domain/management/application/use-cases/fetch-maintenances'
import { GetAppointmentUseCase } from '@/domain/management/application/use-cases/get-appointment'
import { GetCondominiumUseCase } from '@/domain/management/application/use-cases/get-condominium'
import { GetMaintenanceUseCase } from '@/domain/management/application/use-cases/get-maintenance'
import { GetManagerProfileUseCase } from '@/domain/management/application/use-cases/get-manager-profile'
import { RegisterManagerUseCase } from '@/domain/management/application/use-cases/register-manager'
import { RequestFirstAccessCodeUseCase } from '@/domain/management/application/use-cases/request-first-access-code'
import { ScheduleMeetingUseCase } from '@/domain/management/application/use-cases/schedule-meeting'
import { SetManagerPasswordUseCase } from '@/domain/management/application/use-cases/set-manager-password'
import { SignInManagerUseCase } from '@/domain/management/application/use-cases/sign-in-manager'
import { UpdateCondominiumUseCase } from '@/domain/management/application/use-cases/update-condominium'
import { UpdateMaintenanceUseCase } from '@/domain/management/application/use-cases/update-maintenance'
import { UploadAndCreateAttachmentUseCase } from '@/domain/management/application/use-cases/upload-and-create-attachment'
import { VerifyFirstAccessCodeUseCase } from '@/domain/management/application/use-cases/verify-first-access-code'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { MailModule } from '../mail/mail.module'
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
import { FetchCondominiumDashboardController } from './controllers/fetch-condominium-dashboard.controller'
import { FetchCondominiumsController } from './controllers/fetch-condominiums.controller'
import { FetchMaintenancesController } from './controllers/fetch-maintenances.controller'
import { GetAppointmentController } from './controllers/get-appointment.controller'
import { GetCondominiumController } from './controllers/get-condominium.controller'
import { GetMaintenanceController } from './controllers/get-maintenance.controller'
import { GetManagerProfileController } from './controllers/get-manager-profile.controller'
import { HealthCheckController } from './controllers/health-check.controller'
import { RequestFirstAccessCodeController } from './controllers/request-first-access-code.controller'
import { ScheduleController } from './controllers/schedule.controller'
import { SetManagerPasswordController } from './controllers/set-manager-password.controller'
import { UpdateCondominiumController } from './controllers/update-condominium.controller'
import { UpdateMaintenanceController } from './controllers/update-maintenance.controller'
import { UploadAttachmentController } from './controllers/upload-attachment.controller'
import { VerifyFirstAccessCodeController } from './controllers/verify-first-access-code.controller'

@Module({
	imports: [DatabaseModule, CryptographyModule, StorageModule, MailModule],
	controllers: [
		HealthCheckController,
		CreateAccountController,
		AuthenticateController,
		RequestFirstAccessCodeController,
		VerifyFirstAccessCodeController,
		SetManagerPasswordController,
		GetManagerProfileController,
		CreateManagerAvatarController,
		CreateAddressController,
		CreateCondominiumController,
		FetchCondominiumsController,
		FetchCondominiumDashboardController,
		GetCondominiumController,
		UpdateCondominiumController,
		DeleteCondominiumController,
		FetchMaintenancesController,
		GetMaintenanceController,
		FetchAppointmentsController,
		GetAppointmentController,
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
		RequestFirstAccessCodeUseCase,
		VerifyFirstAccessCodeUseCase,
		SetManagerPasswordUseCase,
		GetManagerProfileUseCase,
		CreateManagerAvatarUseCase,
		CreateAddressUseCase,
		CreateCondominiumUseCase,
		FetchCondominiumsByManagerUseCase,
		FetchCondominiumDashboardUseCase,
		GetCondominiumUseCase,
		UpdateCondominiumUseCase,
		DeleteCondominiumUseCase,
		FetchMaintenancesUseCase,
		GetMaintenanceUseCase,
		FetchAppointmentsUseCase,
		GetAppointmentUseCase,
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
