import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsString } from 'class-validator'

export class CreateContractRequestDTO {
	@ApiProperty({
		description: 'Contract title',
	})
	@IsString()
	@IsNotEmpty()
	title: string

	@ApiProperty({
		description: 'Contract description',
	})
	@IsString()
	@IsNotEmpty()
	description: string

	@ApiProperty({
		description: 'Contract start vigency date',
		example: '2026-01-01T00:00:00.000Z',
	})
	@IsDateString()
	startVigencyDate: string

	@ApiProperty({
		description: 'Contract end vigency date',
		example: '2026-12-31T23:59:59.000Z',
	})
	@IsDateString()
	endVigencyDate: string
}
