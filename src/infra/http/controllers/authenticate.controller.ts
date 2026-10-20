import { Body, Controller, Post } from '@nestjs/common'
import { SignInManagerUseCase } from '@/domain/management/application/use-cases/sign-in-manager'
import { AuthenticateRequestDTO } from '@/infra/http/dtos/authenticate.dto'
import { AuthenticatePresenter } from '../presenters/authenticate-presenter'

@Controller({
	version: '1',
	path: 'sessions',
})
export class AuthenticateController {
	constructor(private signInManager: SignInManagerUseCase) {}

	@Post()
	async handle(@Body() body: AuthenticateRequestDTO) {
		const { email, password } = body

		const result = await this.signInManager.execute({
			email,
			password,
		})

		if (result.isLeft()) {
			throw new Error()
		}

		return AuthenticatePresenter.toHTTP(result)
	}
}
