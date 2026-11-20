import { Admin } from '@/domain/management/enterprise/entities/admin'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class AdminPresenter {
	static toHTTP(admin: Admin) {
		return {
			id: admin.id.toString(),
			name: admin.name,
			email: admin.email,
			role: admin.role,
			avatar_url: admin.avatarUrl,
			created_at: admin.createdAt,
			updated_at: admin.updatedAt,
		}
	}
}
