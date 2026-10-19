import {
	Body, Controller,
	HttpCode,
	Post,
	UseGuards
} from '@nestjs/common'
import { CreateCondominiumRequestDTO } from '@/dtos/create-condominium'
import { CreateCondominiumUseCase } from '@/domain/management/application/use-cases/create-condominium'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'

@Controller({
	version: '1',
	path: 'condominium',
})
@UseGuards(JwtAuthGuard)
export class CreateCondominiumController {
	constructor(private createCondominiumUseCase: CreateCondominiumUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(@Body() body: CreateCondominiumRequestDTO) {
		const { managerId, addressId, name } = body
    

		// await this.createCondominiumUseCase.execute({
    //   managerId: new UniqueEntityId(managerId),
    //   addressId: new UniqueEntityId(addressId),
    //   name,
    // })

		return {
			condominium: {
				id: new UniqueEntityId(),
				name,
				managerId,
				addressId,
			},
		}
	}
}
