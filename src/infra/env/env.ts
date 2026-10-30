import { z } from 'zod'

export const envSchema = z.object({
	DATABASE_URL: z.url(),
	JWT_SECRET: z.string(),
	PORT: z.coerce.number().optional().default(3333),
	CLOUDFLARE_ACCOUNT_ID: z.string(),
	AWS_BUCKET_NAME: z.string(),
	AWS_ACCESS_KEY_ID: z.string(),
	AWS_SECRET_ACCESS_KEY: z.string(),
	SMTP_HOST: z.string(),
	SMTP_PORT: z.coerce.number(),
	SMTP_USER: z.string().optional(),
	SMTP_PASSWORD: z.string().optional(),
	MAIL_FROM: z
		.string()
		.optional()
		.default('"Mercadante" <no-reply@mercadante.app>'),
	RABBITMQ_URL: z.string(),
	REDIS_HOST: z.string().optional().default('127.0.0.1'),
	REDIS_PORT: z.coerce.number().optional().default(6379),
	REDIS_DB: z.coerce.number().optional().default(0),
})

export type Env = z.infer<typeof envSchema>
