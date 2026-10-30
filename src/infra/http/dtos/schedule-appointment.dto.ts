import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator'
import { ScheduleType } from '@/domain/management/application/use-cases/schedule-meeting'

export class ScheduleAppointmentRequestDTO {
	@ApiProperty({
		description: 'Appointment type',
		enum: ScheduleType,
	})
	@IsEnum(ScheduleType)
	type: ScheduleType

	@ApiProperty({
		description: 'Appointment title',
	})
	@IsString()
	@IsNotEmpty()
	title: string

	@ApiProperty({
		description: 'Appointment description',
	})
	@IsString()
	@IsNotEmpty()
	description: string

	@ApiProperty({
		description: 'Appointment scheduled date',
		example: '2026-11-15T19:00:00.000Z',
	})
	@IsDateString()
	scheduledAt: string

	@ApiPropertyOptional({
		description: 'Appointment location',
		example: 'Salão de festas',
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	location?: string
}
