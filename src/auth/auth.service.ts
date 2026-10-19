import { Inject, Injectable } from '@nestjs/common'
import bcrypt from 'bcryptjs'
import type { IManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import { PrismaService } from '@/prisma/prisma.service'
import { MANAGERS_REPOSITORY } from './constants'

@Injectable()
export class AuthService {
	constructor(
		@Inject(MANAGERS_REPOSITORY)
		private managersRepository: IManagersRepository,
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
}
