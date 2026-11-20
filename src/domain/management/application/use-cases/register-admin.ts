import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { Admin } from '../../enterprise/entities/admin'
import { HashGenerator } from '../cryptography/hash-generator'
import { AdminsRepository } from '../repositories/admins-repository'
import { ManagersRepository } from '../repositories/managers-repository'
import { AdminAlreadyExistsError } from './errors/admin-already-exists-error'

interface RegisterAdminInput {
	name: string
	email: string
	password: string
}

type RegisterAdminOutput = Either<
	AdminAlreadyExistsError,
	{
		user: Admin
	}
>

@Injectable()
export class RegisterAdminUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private managersRepository: ManagersRepository,
		private hashGenerator: HashGenerator,
	) {}

	async execute({
		name,
		email,
		password,
	}: RegisterAdminInput): Promise<RegisterAdminOutput> {
		const [adminWithSameEmail, userWithSameEmail] = await Promise.all([
			this.adminsRepository.findByEmail(email),
			this.managersRepository.findByEmail(email),
		])

		if (adminWithSameEmail || userWithSameEmail) {
			return left(new AdminAlreadyExistsError(email))
		}

		const hashedPassword = await this.hashGenerator.hash(password)

		const admin = Admin.create({
			name,
			email,
			password: hashedPassword,
		})

		await this.adminsRepository.create(admin)

		return right({ user: admin })
	}
}
