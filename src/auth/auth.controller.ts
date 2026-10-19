import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller({
	version: '1',
	path: 'auth',
})
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('sign-up')
	async signUp(@Body() { name, email, password }) {
		return this.authService.signUp({
			name,
			email,
			password,
		})
	}

	@Post('sign-in')
	async signIn(@Body() { email, password }) {
		return this.authService.signIn({
			email,
			password,
		})
	}
}
