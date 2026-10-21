import { UseCaseError } from '@/core/errors/use-case-error'

export class AddressAlreadyInUseError extends Error implements UseCaseError {
	constructor() {
		super('This address is already associated with another condominium.')
	}
}
