import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	Post,
	UseGuards,
} from '@nestjs/common'
import { CreateAddressUseCase } from '@/domain/management/application/use-cases/create-address'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { CreateAddressRequestDTO } from '@/infra/http/dtos/create-address.dto'

@Controller({
	version: '1',
	path: 'addresses',
})
export class CreateAddressController {
	constructor(private createAddress: CreateAddressUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(@Body() body: CreateAddressRequestDTO) {
		const {
			zipCode,
			street,
			number,
			complement,
			neighborhood,
			city,
			state,
			country,
		} = body

		const response = await this.createAddress.execute({
			zipCode,
			street,
			number,
			complement,
			neighborhood,
			city,
			state,
			country,
		})

		if (response.isLeft()) {
			throw new BadRequestException()
		}
	}
}
