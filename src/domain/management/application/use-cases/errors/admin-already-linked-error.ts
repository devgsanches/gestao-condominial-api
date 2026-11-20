import { UseCaseError } from '@/core/errors/use-case-error'

export class AdminAlreadyLinkedError extends Error implements UseCaseError {
	constructor(identifier: string) {
		super(`Admin "${identifier}" is already linked to this condominium.`)
	}
}
