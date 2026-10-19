import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateAccountRequestDTO {
	@ApiProperty({
		description: 'User name',
	})
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiProperty({
		description: 'User email',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string

	@ApiProperty({
		description: 'User password',
	})
	@IsString()
	@IsNotEmpty()
	password: string
}
