import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAddressRequestDTO {
	@ApiProperty({
		description: 'Zip code',
	})
	@IsString()
	@IsNotEmpty()
	zipCode: string

	@ApiProperty({
		description: 'Street name',
	})
	@IsString()
	@IsNotEmpty()
	street: string

	@ApiProperty({
		description: 'Address number',
	})
	@IsInt()
	@IsNotEmpty()
	number: number

	@ApiProperty({
		description: 'Address complement',
		required: false,
	})
	@IsString()
	@IsOptional()
	complement?: string

	@ApiProperty({
		description: 'Neighborhood',
	})
	@IsString()
	@IsNotEmpty()
	neighborhood: string

	@ApiProperty({
		description: 'City',
	})
	@IsString()
	@IsNotEmpty()
	city: string

	@ApiProperty({
		description: 'State',
	})
	@IsString()
	@IsNotEmpty()
	state: string

	@ApiProperty({
		description: 'Country',
	})
	@IsString()
	@IsNotEmpty()
	country: string
}
