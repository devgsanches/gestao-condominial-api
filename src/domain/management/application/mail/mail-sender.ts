export interface FirstAccessCodeMail {
	email: string
	code: string
	expiresInMinutes: number
}

export abstract class MailSender {
	abstract sendFirstAccessCode(mail: FirstAccessCodeMail): Promise<void>
}
