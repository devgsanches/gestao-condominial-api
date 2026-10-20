import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IManagersRepository } from '@/domain/management/application/repositories/managers-repository'
import { Manager } from '@/domain/management/enterprise/entities/manager'

@Injectable()
export class PrismaManagersRepository implements IManagersRepository {
	create(manager: Manager): Promise<void> {
		throw new Error('Method not implemented.')
	}

	findById(id: UniqueEntityId): Promise<Manager | null> {
		throw new Error('Method not implemented.')
	}

	findByEmail(email: string): Promise<Manager | null> {
		throw new Error('Method not implemented.')
	}
}
