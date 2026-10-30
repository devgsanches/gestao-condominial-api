import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpException,
	NotFoundException,
	Param,
	Post,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AttachContractDocumentUseCase } from '@/domain/management/application/use-cases/attach-contract-document'
import { AttachmentNotFoundError } from '@/domain/management/application/use-cases/errors/attachment-not-found-error'
import { ContractNotFoundError } from '@/domain/management/application/use-cases/errors/contract-not-found-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CreateContractAttachmentRequestDTO } from '../dtos/create-contract-attachment.dto'
import { ContractPresenter } from '../presenters/contract-presenter'

@Controller({
	version: '1',
	path: 'contracts/:contractId/attachments',
})
export class CreateContractAttachmentController {
	constructor(
		private createContractAttachmentUseCase: AttachContractDocumentUseCase,
	) {}

	@Post()
	@HttpCode(201)
	async handle(
		@CurrentUser() user: UserPayload,
		@Body() body: CreateContractAttachmentRequestDTO,
		@Param('contractId') contractId: string,
	) {
		const { attachmentsIds } = body

		const response = await this.createContractAttachmentUseCase.execute({
			managerId: new UniqueEntityId(user.id),
			attachmentsIds: attachmentsIds.map((id) => new UniqueEntityId(id)),
			contractId: new UniqueEntityId(contractId),
		})

		if (response.isLeft()) {
			const error = response.reason

			if (error instanceof HttpException) {
				throw error
			}

			switch (error.constructor) {
				case ContractNotFoundError:
				case AttachmentNotFoundError:
					throw new NotFoundException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		const { contract, attachments } = response.result

		return ContractPresenter.toHTTP(contract, attachments)
	}
}
