import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
	FirstAccessCodeMail,
	MailSender,
} from '@/domain/management/application/mail/mail-sender'
import { FIRST_ACCESS_CODE_EVENT, MAIL_SERVICE } from './mail.constants'

@Injectable()
export class RabbitMQMailSender implements MailSender {
	constructor(@Inject(MAIL_SERVICE) private readonly client: ClientProxy) {}

	async sendFirstAccessCode(mail: FirstAccessCodeMail) {
		this.client.emit<void, FirstAccessCodeMail>(FIRST_ACCESS_CODE_EVENT, mail)
	}
}
