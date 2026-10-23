import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { ScheduleType } from '@/domain/management/application/use-cases/schedule-meeting'

export class FetchAppointmentsQueryDTO {
	@ApiPropertyOptional({
		description: 'Appointment type filter',
		enum: ScheduleType,
	})
	@IsOptional()
	@IsEnum(ScheduleType)
	type?: ScheduleType
}
