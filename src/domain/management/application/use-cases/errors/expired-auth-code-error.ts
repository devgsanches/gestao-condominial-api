import { UseCaseError } from '@/core/errors/use-case-error'

export class ExpiredAuthCodeError extends Error implements UseCaseError {
	constructor() {
		super('Code expired or blocked. Request a new code.')
	}
}
