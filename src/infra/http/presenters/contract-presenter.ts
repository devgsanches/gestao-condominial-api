import { Contract } from '@/domain/management/enterprise/entities/contract'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class ContractPresenter {
	static toHTTP(contract: Contract) {
		return {
			contract: {
				id: contract.id.toString(),
				maintenanceId: contract.maintenanceId.toString(),
				title: contract.title,
				slug: contract.slug.value,
				description: contract.description,
				isValid: contract.isValid,
				startVigencyDate: contract.startVigencyDate,
				endVigencyDate: contract.endVigencyDate,
				created_at: contract.createdAt,
				updated_at: contract.updatedAt,
			},
		}
	}
}
