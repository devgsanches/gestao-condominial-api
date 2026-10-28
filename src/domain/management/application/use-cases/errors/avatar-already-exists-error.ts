import { UseCaseError } from '@/core/errors/use-case-error'

export class AvatarAlreadyExistsError extends Error implements UseCaseError {
	constructor(identifier: string) {
		super(`Avatar with image url "${identifier}" already exists.`)
	}
}
