import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	NotFoundException,
	Patch,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ManagerNotFoundError } from '@/domain/management/application/use-cases/errors/manager-not-found'
import { SetManagerPasswordUseCase } from '@/domain/management/application/use-cases/set-manager-password'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { SetManagerPasswordRequestDTO } from '../dtos/set-manager-password.dto'

@Controller({
	version: '1',
	path: 'accounts/manager/password',
})
export class SetManagerPasswordController {
	constructor(private setManagerPassword: SetManagerPasswordUseCase) {}

	@Patch()
	@HttpCode(204)
	async handle(
		@CurrentUser() user: UserPayload,
		@Body() body: SetManagerPasswordRequestDTO,
	) {
		const response = await this.setManagerPassword.execute({
			managerId: new UniqueEntityId(user.id),
			password: body.password,
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case ManagerNotFoundError:
					throw new NotFoundException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}
	}
}
