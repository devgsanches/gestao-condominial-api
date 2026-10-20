import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Contract } from '../../enterprise/entities/contract'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class ContractsRepository {
	abstract create(contract: Contract): Promise<void>
	abstract save(contract: Contract): Promise<void>
	abstract findById(id: UniqueEntityId): Promise<Contract | null>
	abstract delete(id: UniqueEntityId): Promise<void>
	abstract findByMaintenanceId(maintenanceId: UniqueEntityId): Promise<Contract | null>
}
