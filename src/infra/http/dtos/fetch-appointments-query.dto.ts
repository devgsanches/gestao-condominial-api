import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { ScheduleType } from '@/domain/management/application/use-cases/schedule-meeting'

export class FetchAppointmentsQueryDTO {
	@ApiProperty({
		description: 'Appointment type filter',
		enum: ScheduleType,
	})
	@IsEnum(ScheduleType)
	type: ScheduleType
}
