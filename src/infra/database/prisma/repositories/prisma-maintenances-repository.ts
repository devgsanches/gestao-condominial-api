import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { IMaintenancesRepository } from '@/domain/management/application/repositories/maintenances-repository'
import { MaintenanceType } from '@/domain/management/application/use-cases/fetch-maintenances'
import { Maintenance } from '@/domain/management/enterprise/entities/maintenance'

@Injectable()
export class PrismaMaintenancesRepository implements IMaintenancesRepository {
	create(maintenance: Maintenance): Promise<void> {
		throw new Error('Method not implemented.')
	}

	save(maintenance: Maintenance): Promise<void> {
		throw new Error('Method not implemented.')
	}

	findById(id: UniqueEntityId): Promise<Maintenance | null> {
		throw new Error('Method not implemented.')
	}

	findManyByCondominiumId({
		condominiumId,
		filters,
	}: {
		condominiumId: UniqueEntityId
		filters: { title?: string; type?: MaintenanceType }
	}): Promise<Maintenance[]> {
		throw new Error('Method not implemented.')
	}

	update(maintenance: Maintenance): Promise<Maintenance> {
		throw new Error('Method not implemented.')
	}

	delete(id: UniqueEntityId): Promise<void> {
		throw new Error('Method not implemented.')
	}
}
