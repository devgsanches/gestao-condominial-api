import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class CreateContractAttachmentRequestDTO {
	@ApiProperty({
		description: 'Attachments IDs',
	})
	@IsNotEmpty()
	@IsArray()
	attachmentsIds: string[]
}
