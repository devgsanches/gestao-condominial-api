import { UseCaseError } from '@/core/errors/use-case-error'

export class CondominiumAlreadyExistsError
	extends Error
	implements UseCaseError
{
	constructor(name: string) {
		super(`Condominium "${name}" already exists.`)
	}
}
