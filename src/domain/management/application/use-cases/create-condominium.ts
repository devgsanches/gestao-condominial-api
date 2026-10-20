import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { CondominiumsRepository } from '../repositories/condominiums-repository'
import { Slug } from '../../enterprise/entities/value-objects/slug'
import { BadRequestException, ConflictException } from '@nestjs/common'

interface CreateCondominiumInput {
	managerId: UniqueEntityId
	addressId: UniqueEntityId
	name: string
}

type CreateCondominiumOutput = Either<
ConflictException | BadRequestException,
	{
		condominium: Condominium
	}
>

export class CreateCondominiumUseCase {
	constructor(private condominiumRepository: CondominiumsRepository) {}

	async execute({
		managerId,
		addressId,
		name,
	}: CreateCondominiumInput): Promise<CreateCondominiumOutput> {
		const condominiumAlreadyExists = await this.condominiumRepository.findByName(name)
		
		if (condominiumAlreadyExists) {
			return left(new ConflictException(`Condominium with name "${name}" already exists`))
		}

		const condominiums =
			await this.condominiumRepository.findManyByManagerId(managerId)

		if (condominiums.length >= 50) {
			return left(new BadRequestException('Maximum number of condominiums per manager reached'))
		}

		const condominium = Condominium.create({
			managerId,
			addressId,
			name,
			slug: Slug.createFromText(name),
		})

		await this.condominiumRepository.create(condominium)

		return right({ condominium })
	}
}
