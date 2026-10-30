import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	UnauthorizedException,
} from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CreateContractUseCase } from '@/domain/management/application/use-cases/create-contract'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CreateContractRequestDTO } from '@/infra/http/dtos/create-contract.dto'
import { ContractPresenter } from '../presenters/contract-presenter'

@Controller({
	version: '1',
	path: 'condominium/:condominiumId/maintenances/:maintenanceId/contracts',
})
export class CreateContractController {
	constructor(private createContract: CreateContractUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@Param('condominiumId') condominiumId: string,
		@Param('maintenanceId') maintenanceId: string,
		@Body() body: CreateContractRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const {
			title,
			description,
			supplierName,
			supplierCnpj,
			valueInCents,
			startVigencyDate,
			endVigencyDate,
		} = body

		const response = await this.createContract.execute({
			managerId: new UniqueEntityId(user.id),
			condominiumId: new UniqueEntityId(condominiumId),
			maintenanceId: new UniqueEntityId(maintenanceId),
			title,
			description,
			supplierName,
			supplierCnpj: supplierCnpj.replace(/\D/g, ''),
			valueInCents,
			startVigencyDate: new Date(startVigencyDate),
			endVigencyDate: new Date(endVigencyDate),
		})

		if (response.isLeft()) {
			const error = response.reason

			switch (error.constructor) {
				case NotFoundException:
					throw new NotFoundException(error.message)
				case UnauthorizedException:
					throw new UnauthorizedException(error.message)
				case ConflictException:
					throw new ConflictException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		return ContractPresenter.toHTTP(response.result.contract)
	}
}
