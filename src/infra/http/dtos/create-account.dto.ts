import { UserRole } from '@generated/prisma/enums'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator'

const ACCOUNT_ROLES = [
	UserRole.CONDOMINIUM_MANAGER,
	UserRole.CONDOMINIUM_ADMIN,
] as const

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

	@ApiPropertyOptional({
		description: 'User role. Defaults to condominium manager.',
		enum: ACCOUNT_ROLES,
		default: UserRole.CONDOMINIUM_MANAGER,
	})
	@IsOptional()
	@IsEnum(ACCOUNT_ROLES)
	role?: (typeof ACCOUNT_ROLES)[number]
}
