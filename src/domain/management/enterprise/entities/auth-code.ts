import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface AuthCodeProps {
	email: string
	code: string
	attempts: number
	expiresAt: Date
	usedAt?: Date | null
	createdAt: Date
}

export class AuthCode extends Entity<AuthCodeProps> {
	static readonly MAX_ATTEMPTS = 5

	get email(): string {
		return this.props.email
	}

	get code(): string {
		return this.props.code
	}

	get attempts(): number {
		return this.props.attempts
	}

	get expiresAt(): Date {
		return this.props.expiresAt
	}

	get usedAt(): Date | null {
		return this.props.usedAt ?? null
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	isExpired(now = new Date()): boolean {
		return this.props.expiresAt.getTime() <= now.getTime()
	}

	hasReachedMaxAttempts(): boolean {
		return this.props.attempts >= AuthCode.MAX_ATTEMPTS
	}

	registerFailedAttempt() {
		this.props.attempts += 1
	}

	markAsUsed() {
		this.props.usedAt = new Date()
	}

	static create(
		props: Optional<AuthCodeProps, 'createdAt' | 'attempts'>,
		id?: UniqueEntityId,
	) {
		return new AuthCode(
			{
				...props,
				attempts: props.attempts ?? 0,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)
	}
}
