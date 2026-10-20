import { Body, Controller, Post } from '@nestjs/common'
import { SignInManagerUseCase } from '@/domain/management/application/use-cases/sign-in-manager'
import { AuthenticateRequestDTO } from '@/infra/http/dtos/authenticate.dto'

@Controller({
	version: '1',
	path: 'sessions',
})
export class AuthenticateController {
	constructor(private signInManager: SignInManagerUseCase) {}

	@Post()
	async handle(@Body() body: AuthenticateRequestDTO) {
		const { email, password } = body

		const response = await this.signInManager.execute({
			email,
			password,
		})

		if (response.isRight()) {
			const { access_token } = response.result

			return {
				access_token,
			}
		}
	}
}
