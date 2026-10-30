import { MaintenanceType } from '@generated/prisma/enums'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator'

export enum MaintenancePeriodicityDTO {
	MONTH = 'month',
	TRIMESTER = 'trimester',
	SEMESTER = 'semester',
}

export class CreateMaintenanceRequestDTO {
	@ApiProperty({
		description: 'Maintenance title',
	})
	@IsString()
	@IsNotEmpty()
	title: string

	@ApiProperty({
		description: 'Maintenance description',
	})
	@IsString()
	@IsNotEmpty()
	description: string

	@ApiPropertyOptional({
		description: 'Maintenance type',
		enum: MaintenanceType,
	})
	@IsOptional()
	@IsEnum(MaintenanceType)
	type?: MaintenanceType

	@ApiPropertyOptional({
		description: 'Maintenance periodicity',
		enum: MaintenancePeriodicityDTO,
	})
	@IsOptional()
	@IsEnum(MaintenancePeriodicityDTO)
	periodicity?: MaintenancePeriodicityDTO

	@ApiPropertyOptional({
		description:
			'Expected date (general) or start date (periodic). Defaults to now.',
		example: '2026-11-15T00:00:00.000Z',
	})
	@IsOptional()
	@IsDateString()
	scheduledAt?: string
}
