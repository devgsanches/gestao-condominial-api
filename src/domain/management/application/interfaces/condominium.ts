
export interface CondominiumWithAddress {
	id: string
	name: string
	address: {
		id: string
		city: string
	}
	createdAt: Date
	updatedAt?: Date
}
