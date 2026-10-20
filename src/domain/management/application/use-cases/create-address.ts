import { Injectable } from '@nestjs/common'
import { type Either, right } from '@/core/either'
import { Address } from '../../enterprise/entities/address'
import { AddressesRepository } from '../repositories/addresses-repository'

interface CreateAddressInput {
	zipCode: string
	street: string
	number: number
	complement?: string
	neighborhood: string
	city: string
	state: string
	country: string
}

type CreateAddressOutput = Either<
	never,
	{
		address: Address
	}
>

@Injectable()
export class CreateAddressUseCase {
	constructor(private addressesRepository: AddressesRepository) {}

	async execute({
		zipCode,
		street,
		number,
		complement,
		neighborhood,
		city,
		state,
		country,
	}: CreateAddressInput): Promise<CreateAddressOutput> {
		const address = Address.create({
			zipCode,
			street,
			number,
			complement,
			neighborhood,
			city,
			state,
			country,
		})

		await this.addressesRepository.create(address)

		return right({ address })
	}
}
