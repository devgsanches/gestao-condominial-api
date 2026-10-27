import { ContractAttachmentsRepository } from '@/domain/management/application/repositories/contract-attachments-repository'
import { ContractAttachment } from '@/domain/management/enterprise/entities/contract-attachment'

export class InMemoryContractAttachmentsRepository
	implements ContractAttachmentsRepository
{
	async createMany(attachments: ContractAttachment[]): Promise<void> {
		this.items.push(...attachments)
	}

	async deleteMany(attachments: ContractAttachment[]): Promise<void> {
		this.items = this.items.filter(
			(item) => !attachments.some((a) => a.id.equals(item.id)),
		)
	}

	public items: ContractAttachment[] = []
}
