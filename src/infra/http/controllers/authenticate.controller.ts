import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import {
	AuthenticateRequestDTO,
	AuthenticateResponseDTO,
} from '@/infra/http/dtos/authenticate.dto'

@Controller({
	version: '1',
	path: 'sessions',
})
export class AuthenticateController {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
	) {}

	@Post()
	async handle(
		@Body() body: AuthenticateRequestDTO,
	): Promise<AuthenticateResponseDTO> {
		const { email, password } = body

		const user = await this.prisma.user.findUnique({
			where: {
				email,
			},
		})

		if (!user) {
			throw new UnauthorizedException('User credentials do not match.')
		}

		const isPasswordValid = await compare(password, user.password)

		if (!isPasswordValid) {
			throw new UnauthorizedException('User credentials do not match.')
		}

		const accessToken = this.jwt.sign({ sub: user.id })

		return {
			access_token: accessToken,
		}
	}
}
