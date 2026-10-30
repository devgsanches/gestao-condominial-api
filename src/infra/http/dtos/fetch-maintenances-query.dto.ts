import { MaintenanceType } from '@generated/prisma/enums'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	Min,
} from 'class-validator'

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

	@ApiPropertyOptional({
		description:
			'Only active periodic maintenances without a contract. Overrides "type".',
	})
	@IsOptional()
	@Transform(({ value }) => value === true || value === 'true')
	@IsBoolean()
	withoutContract?: boolean

	@ApiPropertyOptional({
		description: 'Page number (20 items per page)',
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number
}
