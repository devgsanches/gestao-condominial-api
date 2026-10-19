import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsJWT, IsNotEmpty, IsString } from 'class-validator'

export class AuthenticateRequestDTO {
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

export class AuthenticateResponseDTO {
	@ApiProperty({
		description: 'JWT access token',
	})
	@IsJWT()
	@IsNotEmpty()
	access_token: string
}
