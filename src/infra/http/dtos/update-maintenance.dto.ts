import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateMaintenanceRequestDTO {
	@ApiPropertyOptional({
		description: 'Maintenance title',
	})
	@IsOptional()
	@IsString()
	title?: string

	@ApiPropertyOptional({
		description: 'Maintenance description',
	})
	@IsOptional()
	@IsString()
	description?: string
}
