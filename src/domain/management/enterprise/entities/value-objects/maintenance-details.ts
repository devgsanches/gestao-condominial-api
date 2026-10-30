import { ValueObject } from '@/core/entities/value-object'
import type { Attachment } from '../attachment'
import type { Contract } from '../contract'
import type { Maintenance } from '../maintenance'

export interface MaintenanceDetailsProps {
	maintenance: Maintenance
	contract: Contract | null
	attachments: Attachment[]
}

export class MaintenanceDetails extends ValueObject<MaintenanceDetailsProps> {
	get maintenance() {
		return this.props.maintenance
	}

	get contract() {
		return this.props.contract
	}

	get attachments() {
		return this.props.attachments
	}

	static create(props: MaintenanceDetailsProps) {
		return new MaintenanceDetails(props)
	}
}
