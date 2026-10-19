import { Controller, Get } from '@nestjs/common'
import { HealthCheckResponseDTO } from '@/infra/http/dtos/health-check.dto'

@Controller()
export class HealthCheckController {
	@Get()
	handle(): HealthCheckResponseDTO {
		return {
			status: 200,
		}
	}
}
