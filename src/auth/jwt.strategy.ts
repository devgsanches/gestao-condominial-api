import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'

const tokenPayloadSchema = z
	.object({
		sub: z.uuid(),
	})
	.transform(({ sub }) => ({ id: sub }))

export type UserPayload = z.output<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
		})
	}

	async validate(payload: z.input<typeof tokenPayloadSchema>) {
		return tokenPayloadSchema.parse(payload)
	}
}
