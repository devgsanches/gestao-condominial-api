import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { RegisterManagerUseCase } from '@/domain/management/application/use-cases/register-manager'
import { CreateAccountRequestDTO } from '@/infra/http/dtos/create-account.dto'

@Controller({
	version: '1',
	path: 'accounts',
})
export class CreateAccountController {
	constructor(private registerManager: RegisterManagerUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(@Body() body: CreateAccountRequestDTO) {
		const { name, email, password } = body

		await this.registerManager.execute({
			name,
			email,
			password,
		})
	}
}
