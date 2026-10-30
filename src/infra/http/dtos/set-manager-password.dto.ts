import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class SetManagerPasswordRequestDTO {
	@ApiProperty({
		description: 'New password',
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	@MaxLength(72)
	password: string
}
