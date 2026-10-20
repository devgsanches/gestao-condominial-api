import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { AuthService } from './auth.service'
import { MANAGERS_REPOSITORY } from './constants'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			global: true,
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
			}),
		}),
	],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		{ provide: MANAGERS_REPOSITORY, useClass: InMemoryManagersRepository },
		PrismaService,
	],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
