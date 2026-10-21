import { UseCaseError } from '@/core/errors/use-case-error'

export class MaxCondominiumsReachedError extends Error implements UseCaseError {
	constructor() {
		super('Maximum number of condominiums per manager (50) reached.')
	}
}
