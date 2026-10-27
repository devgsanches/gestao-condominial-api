import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	NotFoundException,
	Post,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CreateCondominiumUseCase } from '@/domain/management/application/use-cases/create-condominium'
import { AddressAlreadyInUseError } from '@/domain/management/application/use-cases/errors/address-already-in-use-error'
import { CondominiumAlreadyExistsError } from '@/domain/management/application/use-cases/errors/condominium-already-exists-error'
import { MaxCondominiumsReachedError } from '@/domain/management/application/use-cases/errors/max-condominiums-reached-error'
import { NotAManagerError } from '@/domain/management/application/use-cases/errors/not-a-manager-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CreateCondominiumRequestDTO } from '@/infra/http/dtos/create-condominium'
import { CondominiumPresenter } from '../presenters/condominium-presenter'

@Controller({
	version: '1',
	path: 'condominium',
})
export class CreateCondominiumController {
	constructor(private createCondominiumUseCase: CreateCondominiumUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@Body() body: CreateCondominiumRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const { addressId, name } = body

		const response = await this.createCondominiumUseCase.execute({
			managerId: new UniqueEntityId(user.id),
			addressId: new UniqueEntityId(addressId),
			name,
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case NotFoundException:
					throw new UnauthorizedException(error.message)
				case CondominiumAlreadyExistsError:
					throw new ConflictException(error.message)
				case AddressAlreadyInUseError:
					throw new ConflictException(error.message)
				case MaxCondominiumsReachedError:
					throw new BadRequestException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		return CondominiumPresenter.toHTTP(response.result.condominium)
	}
}
