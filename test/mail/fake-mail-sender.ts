import {
	FirstAccessCodeMail,
	MailSender,
} from '@/domain/management/application/mail/mail-sender'

export class FakeMailSender implements MailSender {
	public firstAccessCodes: FirstAccessCodeMail[] = []

	async sendFirstAccessCode(mail: FirstAccessCodeMail) {
		this.firstAccessCodes.push(mail)
	}
}
