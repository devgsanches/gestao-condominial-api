import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'

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

	@ApiPropertyOptional({
		description: 'Number of units in the condominium',
		example: 48,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	unitsCount?: number
}
