import {
	BadRequestException,
	Controller,
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { InvalidAttachmentTypeError } from '@/domain/management/application/use-cases/errors/invalid-attachment-type-error'
import { UploadAndCreateAttachmentUseCase } from '@/domain/management/application/use-cases/upload-and-create-attachment'
import { AttachmentPresenter } from '../presenters/attachment-presenter'

@Controller({
	version: '1',
	path: 'attachments',
})
export class UploadAttachmentController {
	constructor(
		private uploadAndCreateAttachmentUseCase: UploadAndCreateAttachmentUseCase,
	) {}

	@Post()
	@UseInterceptors(FileInterceptor('file'))
	async handle(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({
						maxSize: 1024 * 1024 * 2, // 2mb
					}),
					new FileTypeValidator({
						fileType: '.(png|jpg|jpeg|pdf)',
					}),
				],
			}),
		)
		file: Express.Multer.File,
	) {
		const response = await this.uploadAndCreateAttachmentUseCase.execute({
			fileName: file.originalname,
			fileType: file.mimetype,
			body: file.buffer,
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case InvalidAttachmentTypeError:
					throw new BadRequestException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		const { attachment } = response.result

		return AttachmentPresenter.toHTTP(attachment)
	}
}
