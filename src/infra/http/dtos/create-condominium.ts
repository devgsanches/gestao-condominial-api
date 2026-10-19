import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCondominiumRequestDTO {
	@ApiProperty({
		description: 'Address ID',
	})
	@IsString()
	@IsNotEmpty()
	addressId: string

	@ApiProperty({
		description: 'Condominium name',
	})
	@IsString()
	@IsNotEmpty()
	name: string
}
