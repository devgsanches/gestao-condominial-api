import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AdminsRepository } from '../repositories/admins-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { AdminAlreadyLinkedError } from './errors/admin-already-linked-error'
import { AdminNotFoundError } from './errors/admin-not-found-error'

interface LinkAdminToCondominiumInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
	adminEmail: string
}

type LinkAdminToCondominiumOutput = Either<
	| NotFoundException
	| UnauthorizedException
	| AdminNotFoundError
	| AdminAlreadyLinkedError,
	Record<string, never>
>

@Injectable()
export class LinkAdminToCondominiumUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private adminsRepository: AdminsRepository,
	) {}

	async execute({
		managerId,
		condominiumId,
		adminEmail,
	}: LinkAdminToCondominiumInput): Promise<LinkAdminToCondominiumOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException('Condominium not found.'))
		}

		if (!condominium.managerId.equals(managerId)) {
			return left(new UnauthorizedException())
		}

		const admin = await this.adminsRepository.findByEmail(adminEmail)

		if (!admin) {
			return left(new AdminNotFoundError(adminEmail))
		}

		const isAlreadyLinked = await this.adminsRepository.isAdminOfCondominium(
			admin.id,
			condominium.id,
		)

		if (isAlreadyLinked) {
			return left(new AdminAlreadyLinkedError(adminEmail))
		}

		await this.adminsRepository.linkToCondominium(admin.id, condominium.id)

		return right({})
	}
}
