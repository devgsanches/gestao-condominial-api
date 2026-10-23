import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { MaintenanceType } from '@/domain/management/application/use-cases/fetch-maintenances'

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
}
