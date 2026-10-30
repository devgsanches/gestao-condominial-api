import type { AuthCodesRepository } from '@/domain/management/application/repositories/auth-codes-repository'
import type { AuthCode } from '@/domain/management/enterprise/entities/auth-code'

export class InMemoryAuthCodesRepository implements AuthCodesRepository {
	public items: AuthCode[] = []

	async create(authCode: AuthCode) {
		this.items.push(authCode)
	}

	async save(authCode: AuthCode) {
		const index = this.items.findIndex((item) => item.id.equals(authCode.id))

		this.items[index] = authCode
	}

	async findLatestActiveByEmail(email: string) {
		const authCodes = this.items
			.filter((item) => item.email === email && !item.usedAt)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

		return authCodes[0] ?? null
	}
}
