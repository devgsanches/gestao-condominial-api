import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IAddressesRepository } from '../repositories/addresses-repository'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'

interface DeleteCondominiumInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
}

type DeleteCondominiumOutput = Either<
	UnauthorizedException | NotFoundException,
	null
>

export class DeleteCondominiumUseCase {
	constructor(
		private condominiumRepository: ICondominiumsRepository,
		private addressesRepository: IAddressesRepository,
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

		await Promise.all([
			this.addressesRepository.delete(condominium.addressId),
			this.condominiumRepository.delete(condominium.id),
		])

		return right(null)
	}
}
