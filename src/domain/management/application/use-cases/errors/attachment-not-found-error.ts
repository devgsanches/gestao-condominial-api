import { UseCaseError } from '@/core/errors/use-case-error'

export class AttachmentNotFoundError extends Error implements UseCaseError {
	constructor() {
		super('Attachment not found.')
	}
}
