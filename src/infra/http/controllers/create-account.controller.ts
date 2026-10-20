import {
	Body,
	ConflictException,
	Controller,
	HttpCode,
	Post,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CreateAccountRequestDTO } from '@/infra/http/dtos/create-account.dto'

@Controller({
	version: '1',
	path: 'accounts',
})
export class CreateAccountController {
	constructor(private prisma: PrismaService) {}

	@Post()
	@HttpCode(201)
	async handle(@Body() body: CreateAccountRequestDTO) {
		const { name, email, password } = body

		const userWithSameEmail = await this.prisma.user.findUnique({
			where: {
				email,
			},
		})

		if (userWithSameEmail) {
			throw new ConflictException(
				'User with same e-mail address already exists.',
			)
		}

		const hashedPassword = await hash(password, 8)

		await this.prisma.user.create({
			data: {
				name,
				role: 'MANAGER',
				email,
				password: hashedPassword,
			},
		})
	}
}
