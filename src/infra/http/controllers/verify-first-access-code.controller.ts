import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	Post,
	UnauthorizedException,
} from '@nestjs/common'
import { ExpiredAuthCodeError } from '@/domain/management/application/use-cases/errors/expired-auth-code-error'
import { InvalidAuthCodeError } from '@/domain/management/application/use-cases/errors/invalid-auth-code-error'
import { VerifyFirstAccessCodeUseCase } from '@/domain/management/application/use-cases/verify-first-access-code'
import { Public } from '@/infra/auth/public'
import { VerifyFirstAccessCodeRequestDTO } from '../dtos/first-access.dto'

@Controller({
	version: '1',
	path: 'sessions/first-access/verify',
})
@Public()
export class VerifyFirstAccessCodeController {
	constructor(private verifyFirstAccessCode: VerifyFirstAccessCodeUseCase) {}

	@Post()
	@HttpCode(200)
	async handle(@Body() body: VerifyFirstAccessCodeRequestDTO) {
		const response = await this.verifyFirstAccessCode.execute({
			email: body.email,
			code: body.code,
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case InvalidAuthCodeError:
				case ExpiredAuthCodeError:
					throw new UnauthorizedException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		const { access_token } = response.result

		return {
			access_token,
		}
	}
}
