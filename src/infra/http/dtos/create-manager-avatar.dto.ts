import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateManagerAvatarRequestDTO {
	@ApiProperty({
		description: 'File name',
	})
	@IsNotEmpty()
	@IsString()
	attachmentId: string
}
