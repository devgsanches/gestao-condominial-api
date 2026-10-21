import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LocalStrategy } from './local.strategy'

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			imports: [EnvModule],
			inject: [EnvService],
			global: true,
			useFactory: async (env: EnvService) => ({
				secret: env.get('JWT_SECRET'),
			}),
		}),
	],
	providers: [
		JwtStrategy,
		EnvService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		PrismaService,
		AuthService,
		LocalStrategy,
	],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
