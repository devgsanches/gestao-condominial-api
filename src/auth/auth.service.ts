import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcryptjs'
import type { IManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import { PrismaService } from '@/prisma/prisma.service'
import { MANAGERS_REPOSITORY } from './constants'

@Injectable()
export class AuthService {
	constructor(
		@Inject(MANAGERS_REPOSITORY)
		private managersRepository: IManagersRepository,
		private jwtService: JwtService,
		private prisma: PrismaService,
	) {}

	async validateUser(email: string, password: string): Promise<any> {
		const user = await this.prisma.user.findUnique({ where: { email } })
		if (user && (await bcrypt.compare(password, user.password))) {
			const { password: _, ...result } = user
			return result
		}
		return null
	}

	async signUp({ name, email, password }) {
		const hashedPassword = await bcrypt.hash(password, 10)

		const manager = await this.prisma.user.create({
			data: {
				name,
				role: 'MANAGER',
				email,
				password: hashedPassword,
			},
		})

		const { password: _, ...managerWithoutPassword } = manager

		return managerWithoutPassword
	}

	async signIn({ email, password }: any) {
		const user = await this.prisma.user.findUnique({
			where: {
				email,
			},
		})

		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const isPasswordValid = await bcrypt.compare(password, user.password)

		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const payload = { sub: user.id }

		return {
			access_token: this.jwtService.sign(payload),
		}
	}
}
