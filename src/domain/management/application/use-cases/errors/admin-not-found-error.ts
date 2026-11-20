import { UseCaseError } from '@/core/errors/use-case-error'

export class AdminNotFoundError extends Error implements UseCaseError {
	constructor(identifier: string) {
		super(`Admin "${identifier}" not found.`)
	}
}
