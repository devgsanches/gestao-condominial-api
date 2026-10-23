import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { MaintenanceType } from '@/domain/management/application/use-cases/fetch-maintenances'

export class FetchMaintenancesQueryDTO {
	@ApiPropertyOptional({
		description: 'Maintenance type filter',
		enum: MaintenanceType,
	})
	@IsOptional()
	@IsEnum(MaintenanceType)
	type?: MaintenanceType

	@ApiPropertyOptional({
		description: 'Maintenance title filter',
	})
	@IsOptional()
	@IsString()
	title?: string
}
