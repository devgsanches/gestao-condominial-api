import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Condominium } from '../../enterprise/entities/condominium'
import { ICondominiumsRepository } from '../repositories/condominiums-repository'
import { Maintenance } from '../../enterprise/entities/maintenance'
import { IMaintenancesRepository } from '../repositories/maintenances-repository'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'

interface CreateMaintenanceInput {
	managerId: UniqueEntityId
	condominiumId: UniqueEntityId
  type?: 'general' | 'periodic' 
  title: string
  description: string
}

type CreateMaintenanceOutput = Either<
	NotFoundException |
	UnauthorizedException,
	{
		maintenance: Maintenance
	}
>

export class CreateMaintenanceUseCase {
	constructor(
    private condominiumRepository: ICondominiumsRepository,
    private maintenanceRepository: IMaintenancesRepository) {}

	async execute({
		managerId,
		condominiumId,
		type = 'general',
		title,
		description,
	}: CreateMaintenanceInput): Promise<CreateMaintenanceOutput> {
		const condominium = await this.condominiumRepository.findById(condominiumId)

		if (!condominium) {
			return left(new NotFoundException())
		}

		const isCondominiumManager = condominium.managerId.equals(managerId)

		if (!isCondominiumManager) {
			return left(new UnauthorizedException())
		}

    const maintenance = Maintenance.create({
			condominiumId,
			type: type ?? 'general',
			title,
			description,
		})

		await this.maintenanceRepository.create(maintenance)

		return right({ maintenance })
	}
}
