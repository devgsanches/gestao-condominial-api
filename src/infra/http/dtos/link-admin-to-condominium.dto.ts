import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class LinkAdminToCondominiumRequestDTO {
	@ApiProperty({
		description: 'Admin email',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string
}
