import { UseCaseError } from '@/core/errors/use-case-error'

export class DatabaseError extends Error implements UseCaseError {
	constructor(message?: string) {
		super(
			message ??
				'Database error, please, check if the payload is valid and try again.',
		)
	}
}
