import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { RequestFirstAccessCodeUseCase } from '@/domain/management/application/use-cases/request-first-access-code'
import { Public } from '@/infra/auth/public'
import { RequestFirstAccessCodeRequestDTO } from '../dtos/first-access.dto'

@Controller({
	version: '1',
	path: 'sessions/first-access',
})
@Public()
export class RequestFirstAccessCodeController {
	constructor(private requestFirstAccessCode: RequestFirstAccessCodeUseCase) {}

	@Post()
	@HttpCode(202)
	async handle(@Body() body: RequestFirstAccessCodeRequestDTO) {
		await this.requestFirstAccessCode.execute({ email: body.email })

		return {
			message: 'If the email is registered, a code will be sent to it shortly.',
		}
	}
}
