import { AuthCode } from '../../enterprise/entities/auth-code'

export abstract class AuthCodesRepository {
	abstract create(authCode: AuthCode): Promise<void>
	abstract save(authCode: AuthCode): Promise<void>
	abstract findLatestActiveByEmail(email: string): Promise<AuthCode | null>
}
