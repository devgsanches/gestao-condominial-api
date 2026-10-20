import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IContractsRepository } from '@/domain/management/application/repositories/contracts-repository'
import { Contract } from '@/domain/management/enterprise/entities/contract'

@Injectable()
export class PrismaContractsRepository implements IContractsRepository {
	create(contract: Contract): Promise<void> {
		throw new Error('Method not implemented.')
	}
	save(contract: Contract): Promise<void> {
		throw new Error('Method not implemented.')
	}
	findById(id: UniqueEntityId): Promise<Contract | null> {
		throw new Error('Method not implemented.')
	}
	delete(id: UniqueEntityId): Promise<void> {
		throw new Error('Method not implemented.')
	}
	findByMaintenanceId(maintenanceId: UniqueEntityId): Promise<Contract | null> {
		throw new Error('Method not implemented.')
	}
}
