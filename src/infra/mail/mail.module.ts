import path from 'node:path'
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter'
import { MailSender } from '@/domain/management/application/mail/mail-sender'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { MAIL_QUEUE, MAIL_SERVICE } from './mail.constants'
import { MailConsumer } from './mail.consumer'
import { RabbitMQMailSender } from './rabbitmq-mail-sender'

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [EnvModule],
			inject: [EnvService],
			useFactory: (env: EnvService) => {
				const user = env.get('SMTP_USER')
				const pass = env.get('SMTP_PASSWORD')

				return {
					transport: {
						host: env.get('SMTP_HOST'),
						port: env.get('SMTP_PORT'),
						secure: false,
						auth: user && pass ? { user, pass } : undefined,
					},
					defaults: {
						from: env.get('MAIL_FROM'),
					},
					template: {
						dir: path.join(__dirname, 'templates'),
						adapter: new HandlebarsAdapter(),
						options: {
							strict: true,
						},
					},
				}
			},
		}),
		ClientsModule.registerAsync([
			{
				name: MAIL_SERVICE,
				imports: [EnvModule],
				inject: [EnvService],
				useFactory: (env: EnvService) => ({
					transport: Transport.RMQ,
					options: {
						urls: [env.get('RABBITMQ_URL')],
						queue: MAIL_QUEUE,
						queueOptions: { durable: true },
					},
				}),
			},
		]),
	],
	providers: [
		{
			provide: MailSender,
			useClass: RabbitMQMailSender,
		},
	],
	controllers: [MailConsumer],
	exports: [MailSender],
})
export class MailModule {}
