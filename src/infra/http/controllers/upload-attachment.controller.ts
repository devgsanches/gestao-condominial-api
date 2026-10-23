import { User } from '@generated/prisma/client'
import { Controller, HttpCode, Post } from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'

@Controller({
	version: '1',
	path: 'contracts/:contractId/attachments',
})
export class UploadAttachmentController {
	// constructor() {}

	@Post()
	@HttpCode(200)
	async handle(@CurrentUser() user: User) {
		// const response = await this.uploadAttachment.execute({
		// 	managerId: new UniqueEntityId(user.id),
		// })

		// if (response.isLeft()) {
		// 	const error = response.reason

		// 	switch (error.constructor) {
		// 		case ManagerNotFoundError:
		// 			throw new NotFoundException(error.message)
		// 		default:
		// 			throw new BadRequestException(error.message)
		// 	}
		// }

		return 'Attachment uploaded'
	}
}
