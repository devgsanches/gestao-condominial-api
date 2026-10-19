import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from '@/prisma/prisma.service'
import { InMemoryManagersRepository } from '@/test/repositories/in-memory-managers-repository'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { MANAGERS_REPOSITORY } from './constants'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		{ provide: MANAGERS_REPOSITORY, useClass: InMemoryManagersRepository },
		PrismaService,
	],
	exports: [AuthService],
})
export class AuthModule {}
