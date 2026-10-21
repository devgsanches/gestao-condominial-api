import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	Post,
	UseGuards,
} from '@nestjs/common'
import { ManagerAlreadyExistsError } from '@/domain/management/application/use-cases/errors/manager-already-exists-error'
import { RegisterManagerUseCase } from '@/domain/management/application/use-cases/register-manager'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { CreateAccountRequestDTO } from '@/infra/http/dtos/create-account.dto'
import { ManagerPresenter } from '../presenters/manager-presenter'

@Controller({
	version: '1',
	path: 'accounts',
})
@UseGuards(JwtAuthGuard)
export class CreateAccountController {
	constructor(private registerManager: RegisterManagerUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(@Body() body: CreateAccountRequestDTO) {
		const { name, email, password } = body

		const response = await this.registerManager.execute({
			name,
			email,
			password,
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case ManagerAlreadyExistsError:
					throw new ConflictException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		return ManagerPresenter.toHTTP(response.result.manager)
	}
}
