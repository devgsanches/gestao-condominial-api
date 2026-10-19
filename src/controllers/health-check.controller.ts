import { Controller, Get } from '@nestjs/common'
import { HealthCheckResponseDTO } from '@/dtos/health-check.dto'

@Controller()
export class HealthCheckController {
	@Get()
	handle(): HealthCheckResponseDTO {
		return {
			status: 200,
		}
	}
}
