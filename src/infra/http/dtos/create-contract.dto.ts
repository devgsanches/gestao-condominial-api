import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsDateString,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
	Matches,
} from 'class-validator'

export class CreateContractRequestDTO {
	@ApiProperty({
		description: 'Supplier company name',
		example: 'Atlas Elevadores Ltda.',
	})
	@IsString()
	@IsNotEmpty()
	supplierName: string

	@ApiProperty({
		description: 'Supplier CNPJ, masked or digits only',
		example: '12.345.678/0001-90',
	})
	@IsString()
	@Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, {
		message: 'supplierCnpj must be a valid CNPJ with 14 digits',
	})
	supplierCnpj: string

	@ApiProperty({
		description: 'Contract value per period, in cents',
		example: 125000,
	})
	@IsInt()
	@IsPositive()
	valueInCents: number

	@ApiPropertyOptional({
		description: 'Contract title',
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	title?: string

	@ApiPropertyOptional({
		description: 'Contract description',
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	description?: string

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
