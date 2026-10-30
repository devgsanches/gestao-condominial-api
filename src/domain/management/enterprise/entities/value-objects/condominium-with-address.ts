import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import type { Condominium } from '../condominium'

export interface CondominiumAddressSummary {
	id: UniqueEntityId
	city: string
}

export interface CondominiumWithAddressProps {
	condominium: Condominium
	address: CondominiumAddressSummary
	periodicWithoutContractCount: number
}

export class CondominiumWithAddress extends ValueObject<CondominiumWithAddressProps> {
	get condominium() {
		return this.props.condominium
	}

	get address() {
		return this.props.address
	}

	get periodicWithoutContractCount() {
		return this.props.periodicWithoutContractCount
	}

	static create(props: CondominiumWithAddressProps) {
		return new CondominiumWithAddress(props)
	}
}
