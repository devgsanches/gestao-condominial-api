import { MaintenanceType } from '@generated/prisma/enums'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'

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
