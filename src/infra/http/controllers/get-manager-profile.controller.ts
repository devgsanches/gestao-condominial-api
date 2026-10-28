import { User } from '@generated/prisma/client'
import {
	BadRequestException,
	Controller,
	Get,
	HttpCode,
	NotFoundException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ManagerNotFoundError } from '@/domain/management/application/use-cases/errors/manager-not-found'
import { GetManagerProfileUseCase } from '@/domain/management/application/use-cases/get-manager-profile'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { ManagerWithCondominiumsPresenter } from '../presenters/manager-with-condominiums-presenter'

@Controller({
	version: '1',
	path: 'accounts/manager/profile',
})
export class GetManagerProfileController {
	constructor(private getManagerProfile: GetManagerProfileUseCase) {}

	@Get()
	@HttpCode(200)
	async handle(@CurrentUser() user: User) {
		const response = await this.getManagerProfile.execute({
			managerId: new UniqueEntityId(user.id),
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

		const managerWithCondominiums = response.result

		return ManagerWithCondominiumsPresenter.toHTTP(managerWithCondominiums)
	}
}
