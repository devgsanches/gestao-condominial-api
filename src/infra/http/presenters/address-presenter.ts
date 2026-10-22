import { Address } from '@/domain/management/enterprise/entities/address'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class AddressPresenter {
	static toHTTP(address: Address) {
		return {
			address: {
				id: address.id.toString(),
				zipCode: address.zipCode,
				street: address.street,
				number: address.number,
				complement: address.complement,
				neighborhood: address.neighborhood,
				city: address.city,
				state: address.state,
				country: address.country,
				created_at: address.createdAt,
				updated_at: address.updatedAt,
			},
		}
	}
}
