import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, Matches } from 'class-validator'

export class RequestFirstAccessCodeRequestDTO {
	@ApiProperty({
		description: 'Manager email that will receive the code',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string
}

export class VerifyFirstAccessCodeRequestDTO {
	@ApiProperty({
		description: 'Manager email',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string

	@ApiProperty({
		description: '4 digit code sent by email',
		example: '0427',
	})
	@Matches(/^\d{4}$/, { message: 'code must have 4 digits' })
	code: string
}
