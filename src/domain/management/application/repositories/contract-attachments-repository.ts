import { ContractAttachment } from '../../enterprise/entities/contract-attachment'
// import type { IPaginationParams } from '@/core/repositories/pagination-params'

export abstract class ContractAttachmentsRepository {
	abstract createMany(attachments: ContractAttachment[]): Promise<void>
	abstract deleteMany(attachments: ContractAttachment[]): Promise<void>
}
