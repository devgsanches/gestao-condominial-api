import { Injectable } from '@nestjs/common'
import bcrypt from 'bcryptjs'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	// biome-ignore lint/suspicious/noExplicitAny: any é usado para retornar o usuário sem a senha
	async validateUser(email: string, password: string): Promise<any> {
		const user = await this.prisma.user.findUnique({ where: { email } })
		if (user && (await bcrypt.compare(password, user.password))) {
			const { password: _, ...result } = user
			return result
		}
		return null
	}
}
