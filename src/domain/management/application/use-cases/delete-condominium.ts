import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AddressesRepository } from '../repositories/addresses-repository'
import { CondominiumsRepository } from '../repositories/condominiums-repository'

interface DeleteCondominiumInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type DeleteCondominiumOutput = Either<
	UnauthorizedException | NotFoundException,
	null
>

@Injectable()
export class DeleteCondominiumUseCase {
	constructor(
		private condominiumRepository: CondominiumsRepository,
		private addressesRepository: AddressesRepository,
	) {}

	// managerId virá a partir da autenticação do síndico - rota estará protegida
	async execute({
		managerId,
		condominiumId,
	}: DeleteCondominiumInput): Promise<DeleteCondominiumOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		const isCondominiumManager = condominium?.managerId.equals(managerId)

		// somente o síndico do condomínio pode deletar um condomínio
		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

		if (!condominium) {
			return left(new NotFoundException())
		}

		await this.condominiumRepository.delete(condominium.id)
		await this.addressesRepository.delete(condominium.addressId)

		return right(null)
	}
}
