import { UseCaseError } from '@/core/errors/use-case-error'

export class NotAManagerError extends Error implements UseCaseError {
	constructor() {
		super('Just managers can create condominiums.')
	}
}
