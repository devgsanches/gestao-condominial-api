import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'
import { EnvService } from '../env/env.service'

const tokenPayloadSchema = z
	.object({
		sub: z.uuid(),
	})
	.transform(({ sub }) => ({ id: sub }))

export type UserPayload = z.output<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(config: EnvService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.get('JWT_SECRET'),
		})
	}

	async validate(payload: z.input<typeof tokenPayloadSchema>) {
		return tokenPayloadSchema.parse(payload)
	}
}
