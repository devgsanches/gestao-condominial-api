import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ICondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import { Condominium } from '@/domain/management/enterprise/entities/condominium'

@Injectable()
export class PrismaCondominiumsRepository implements ICondominiumsRepository {
	create(condominium: Condominium): Promise<void> {
		throw new Error('Method not implemented.')
	}
	findByName(name: string): Promise<Condominium | null> {
		throw new Error('Method not implemented.')
	}
	findById(id: UniqueEntityId): Promise<Condominium | null> {
		throw new Error('Method not implemented.')
	}
	findManyByManagerId(managerId: UniqueEntityId): Promise<Condominium[]> {
		throw new Error('Method not implemented.')
	}
	findByManagerId(managerId: UniqueEntityId): Promise<Condominium | null> {
		throw new Error('Method not implemented.')
	}
	update(condominium: Pick<Condominium, 'name' | 'id'>): Promise<Condominium> {
		throw new Error('Method not implemented.')
	}
	delete(id: UniqueEntityId): Promise<void> {
		throw new Error('Method not implemented.')
	}
}
