import { Attachment } from '@/domain/management/enterprise/entities/attachment'
import { Contract } from '@/domain/management/enterprise/entities/contract'

export type ContractStatus = 'valid' | 'invalidated'

export function toContractStatus(isValid: boolean): ContractStatus {
	return isValid ? 'valid' : 'invalidated'
}

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class ContractPresenter {
	static toHTTP(contract: Contract, attachments: Attachment[] = []) {
		return {
			contract: ContractPresenter.toHTTPItem(contract, attachments),
		}
	}

	static toHTTPItem(contract: Contract, attachments: Attachment[] = []) {
		return {
			id: contract.id.toString(),
			maintenanceId: contract.maintenanceId.toString(),
			title: contract.title,
			slug: contract.slug.value,
			description: contract.description,
			supplierName: contract.supplierName,
			supplierCnpj: contract.supplierCnpj,
			valueInCents: contract.valueInCents,
			isValid: contract.isValid,
			status: toContractStatus(contract.isValid),
			startVigencyDate: contract.startVigencyDate,
			endVigencyDate: contract.endVigencyDate,
			attachments: attachments.map((attachment) => ({
				id: attachment.id.toString(),
				title: attachment.title,
				url: attachment.url,
				createdAt: attachment.createdAt,
			})),
		}
	}
}
