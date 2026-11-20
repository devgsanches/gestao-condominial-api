import { UserRole } from '@generated/prisma/enums'
import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	Post,
} from '@nestjs/common'
import { AdminAlreadyExistsError } from '@/domain/management/application/use-cases/errors/admin-already-exists-error'
import { ManagerAlreadyExistsError } from '@/domain/management/application/use-cases/errors/manager-already-exists-error'
import { RegisterAdminUseCase } from '@/domain/management/application/use-cases/register-admin'
import { RegisterManagerUseCase } from '@/domain/management/application/use-cases/register-manager'
import { Public } from '@/infra/auth/public'
import { CreateAccountRequestDTO } from '@/infra/http/dtos/create-account.dto'
import { AdminPresenter } from '../presenters/admin-presenter'
import { ManagerPresenter } from '../presenters/manager-presenter'

@Controller({
	version: '1',
	path: 'accounts',
})
@Public()
export class CreateAccountController {
	constructor(
		private registerManager: RegisterManagerUseCase,
		private registerAdmin: RegisterAdminUseCase,
	) {}

	@Post()
	@HttpCode(201)
	async handle(@Body() body: CreateAccountRequestDTO) {
		const { name, email, password, role } = body

		if (role === UserRole.CONDOMINIUM_ADMIN) {
			const response = await this.registerAdmin.execute({
				name,
				email,
				password,
			})

			if (response.isLeft()) {
				throw this.toHttpError(response.reason)
			}

			return AdminPresenter.toHTTP(response.result.user)
		}

		const response = await this.registerManager.execute({
			name,
			email,
			password,
		})

		if (response.isLeft()) {
			throw this.toHttpError(response.reason)
		}

		return ManagerPresenter.toHTTP(response.result.user)
	}

	private toHttpError(error: Error) {
		switch (error.constructor) {
			case ManagerAlreadyExistsError:
			case AdminAlreadyExistsError:
				return new ConflictException(error.message)
			default:
				return new BadRequestException(error.message)
		}
	}
}
