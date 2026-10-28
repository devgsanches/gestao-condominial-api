import { Manager } from '@/domain/management/enterprise/entities/manager'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class ManagerPresenter {
	static toHTTP(manager: Manager) {
		return {
			id: manager.id.toString(),
			name: manager.name,
			email: manager.email,
			role: manager.role,
			avatar_url: manager.avatarUrl,
			created_at: manager.createdAt,
			updated_at: manager.updatedAt,
		}
	}
}
