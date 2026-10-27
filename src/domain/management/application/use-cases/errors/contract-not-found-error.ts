import { UseCaseError } from '@/core/errors/use-case-error'

export class ContractNotFoundError extends Error implements UseCaseError {
	constructor() {
		super('Contract not found.')
	}
}
