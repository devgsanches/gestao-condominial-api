import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class HealthCheckResponseDTO {
	@ApiProperty({
		description: 'API status',
		example: 200,
	})
	@IsNumber()
	@IsNotEmpty()
	status: number
}
