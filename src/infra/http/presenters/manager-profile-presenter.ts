import { Manager } from '@/domain/management/enterprise/entities/manager'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class ManagerProfilePresenter {
	static toHTTP(manager: Manager) {
		return {
			managerId: manager.id.toString(),
			name: manager.name,
			email: manager.email,
			avatarUrl: manager.avatarUrl,
			createdAt: manager.createdAt,
			updatedAt: manager.updatedAt,
		}
	}
}
