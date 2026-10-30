import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { MailerService } from '@nestjs-modules/mailer'
import type { FirstAccessCodeMail } from '@/domain/management/application/mail/mail-sender'
import { FIRST_ACCESS_CODE_EVENT } from './mail.constants'

@Controller()
export class MailConsumer {
	constructor(private readonly mailer: MailerService) {}

	@EventPattern(FIRST_ACCESS_CODE_EVENT)
	async handleFirstAccessCode(@Payload() data: FirstAccessCodeMail) {
		await this.mailer.sendMail({
			to: data.email,
			subject: 'Mercadante - Código de primeiro acesso',
			template: 'first-access-code',
			context: {
				code: data.code,
				expiration: `${data.expiresInMinutes} minutos`,
				year: new Date().getFullYear(),
			},
		})
	}
}
