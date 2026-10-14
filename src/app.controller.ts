import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { AuthService } from './auth/auth.service'

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly authService: AuthService,
	) {}

	@Get()
	healthCheck() {
		return {
			status: 200,
		}
	}

	@Post('auth/sign-up')
	async signUp(@Body() { name, email, password }) {
		return this.authService.signUp({
			name,
			email,
			password,
		})
	}

	@Post('auth/sign-in')
	async signIn(@Body() { email, password }) {
		return this.authService.signIn({
			email,
			password,
		})
	}
}
