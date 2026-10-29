import { UseCaseError } from '@/core/errors/use-case-error'

export class CondominiumInformationNotFoundError
	extends Error
	implements UseCaseError
{
	constructor(identifier: string) {
		super(`Condominium information for "${identifier}" not found.`)
	}
}
