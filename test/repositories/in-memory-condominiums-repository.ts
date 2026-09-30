import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ICondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import type { Condominium } from '@/domain/management/enterprise/entities/condominium'

export class InMemoryCondominiumsRepository implements ICondominiumsRepository {
	public items: Condominium[] = []

	async create(condominium: Condominium) {
		this.items.push(condominium)
	}

	async findById(id: UniqueEntityId) {
		const condominium = this.items.find((item) => item.id === id)

		if (!condominium) {
			return null
		}

		return condominium
	}

	// async delete(id: UniqueEntityId) {
	// 	const condominiums = this.items.filter((item) => item.id !== id)

	// 	this.items = condominiums

	// 	return condominiums
	// }
}
