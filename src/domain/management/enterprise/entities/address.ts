import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface AddressProps {
	zipCode: string
	street: string
	number: number
	complement?: string
	neighborhood: string
	city: string
	state: string
	country: string
	createdAt: Date
	updatedAt?: Date
}

export class Address extends Entity<AddressProps> {
	get zipCode(): string {
		return this.props.zipCode
	}

	set zipCode(zipCode: string) {
		this.props.zipCode = zipCode
	}

	get street(): string {
		return this.props.street
	}

	set street(street: string) {
		this.props.street = street
	}

	get number(): number {
		return this.props.number
	}

	set number(number: number) {
		this.props.number = number
	}

	get complement(): string | undefined {
		return this.props.complement
	}

	set complement(complement: string | undefined) {
		this.props.complement = complement
	}

	get neighborhood(): string {
		return this.props.neighborhood
	}

	set neighborhood(neighborhood: string) {
		this.props.neighborhood = neighborhood
	}

	get city(): string {
		return this.props.city
	}

	set city(city: string) {
		this.props.city = city
	}

	get state(): string {
		return this.props.state
	}

	set state(state: string) {
		this.props.state = state
	}

	get country(): string {
		return this.props.country
	}

	set country(country: string) {
		this.props.country = country
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date | undefined {
		return this.props.updatedAt
	}

	static create(
		props: Optional<AddressProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const address = new Address(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return address
	}
}
