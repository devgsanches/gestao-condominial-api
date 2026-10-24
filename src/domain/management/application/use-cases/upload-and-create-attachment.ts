import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { AttachmentsRepository } from '../../application/repositories/attachments-repository'
import { Attachment } from '../../enterprise/entities/attachment'
import { Uploader } from '../storage/uploader'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'

interface UploadAndCreateAttachmentInput {
	fileName: string
	fileType: string
	body: Buffer
}

type UploadAndCreateAttachmentOutput = Either<
	InvalidAttachmentTypeError,
	{ attachment: Attachment }
>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
	constructor(
		private attachmentsRepository: AttachmentsRepository,
		private uploader: Uploader,
	) {}

	async execute({
		fileName,
		fileType,
		body,
	}: UploadAndCreateAttachmentInput): Promise<UploadAndCreateAttachmentOutput> {
		const fyleTypeIsValid = /^(image\/(jpeg|png))$|^application\/pdf$/.test(
			fileType,
		)

		if (!fyleTypeIsValid) {
			return left(new InvalidAttachmentTypeError(fileType))
		}

		const { url } = await this.uploader.upload({ fileName, fileType, body })

		const attachment = Attachment.create({
			title: fileName,
			url,
		})

		await this.attachmentsRepository.create(attachment)

		return right({
			attachment,
		})
	}
}
