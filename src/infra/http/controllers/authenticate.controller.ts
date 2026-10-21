import {
	BadRequestException,
	Body,
	Controller,
	Post,
	UnauthorizedException,
} from '@nestjs/common'
import { WrongCredentialsError } from '@/domain/management/application/use-cases/errors/wrong-credentials-error'
import { SignInManagerUseCase } from '@/domain/management/application/use-cases/sign-in-manager'
import { Public } from '@/infra/auth/public'
import { AuthenticateRequestDTO } from '@/infra/http/dtos/authenticate.dto'

@Controller({
	version: '1',
	path: 'sessions',
})
@Public()
export class AuthenticateController {
	constructor(private signInManager: SignInManagerUseCase) {}

	@Post()
	async handle(@Body() body: AuthenticateRequestDTO) {
		const { email, password } = body

		const session = await this.signInManager.execute({
			email,
			password,
		})

		if (session.isLeft()) {
			const error = session.reason

			switch (error.constructor) {
				case WrongCredentialsError:
					throw new UnauthorizedException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		const { access_token } = session.result

		return {
			access_token,
		}
	}
}
