import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidAuthCodeError extends Error implements UseCaseError {
	constructor() {
		super('Invalid code.')
	}
}
