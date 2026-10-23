import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateCondominiumRequestDTO {
	@ApiProperty({
		description: 'Condominium name',
	})
	@IsString()
	@IsNotEmpty()
	name: string
}
