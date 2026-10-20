import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IAddressesRepository } from '@/domain/management/application/repositories/addresses-repository'
import { Address } from '@/domain/management/enterprise/entities/address'

@Injectable()
export class PrismaAddressesRepository implements IAddressesRepository {
	create(address: Address): Promise<void> {
		throw new Error('Method not implemented.')
	}
	findById(id: UniqueEntityId): Promise<Address | null> {
		throw new Error('Method not implemented.')
	}
	delete(id: UniqueEntityId): Promise<void> {
		throw new Error('Method not implemented.')
	}
}
