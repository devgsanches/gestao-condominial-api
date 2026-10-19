import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { CreateCondominiumRequestDTO } from '@/infra/http/dtos/create-condominium'

@Controller({
	version: '1',
	path: 'condominium',
})
@UseGuards(JwtAuthGuard)
export class CreateCondominiumController {
	constructor(
		/* private createCondominiumUseCase: CreateCondominiumUseCase */
	) {}

	@Post()
	@HttpCode(201)
	async handle(
		@Body() body: CreateCondominiumRequestDTO,
		@CurrentUser() user: UserPayload,
	) {
		const { addressId, name } = body

		// await this.createCondominiumUseCase.execute({
		//   managerId: new UniqueEntityId(managerId),
		//   addressId: new UniqueEntityId(addressId),
		//   name,
		// })

		return {
			condominium: {
				id: new UniqueEntityId(),
				managerId: new UniqueEntityId(user.id),
				addressId,
				name,
			},
		}
	}
}
