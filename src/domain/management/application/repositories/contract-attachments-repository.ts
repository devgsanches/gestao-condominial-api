import { ContractAttachment } from '../../enterprise/entities/contract-attachment'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class ContractAttachmentsRepository {
	abstract create(contractAttachment: ContractAttachment): Promise<void>
}
