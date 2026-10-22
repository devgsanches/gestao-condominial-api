import { Controller, Get } from '@nestjs/common'
import { Public } from '@/infra/auth/public'
import { HealthCheckResponseDTO } from '@/infra/http/dtos/health-check.dto'

@Controller()
@Public()
export class HealthCheckController {
	@Get()
	handle(): HealthCheckResponseDTO {
		return {
			status: 200,
		}
	}
}
