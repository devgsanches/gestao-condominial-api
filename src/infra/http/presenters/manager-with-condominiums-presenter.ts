import { ManagerWithCondominiums } from '@/domain/management/enterprise/entities/value-objects/manager-with-condominiums'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class ManagerWithCondominiumsPresenter {
	static toHTTP(managerWithCondominiums: ManagerWithCondominiums) {
		return {
			managerId: managerWithCondominiums.managerId.toString(),
			name: managerWithCondominiums.name,
			email: managerWithCondominiums.email,
			createdAt: managerWithCondominiums.createdAt,
			updatedAt: managerWithCondominiums.updatedAt,
			condominiums: managerWithCondominiums.condominiums.map((condominium) => ({
				condominiumId: condominium.condominiumId.toString(),
				name: condominium.name,
				address: {
					id: condominium.address.id.toString(),
					city: condominium.address.city,
				},
				createdAt: condominium.createdAt,
				updatedAt: condominium.updatedAt,
			})),
		}
	}
}
