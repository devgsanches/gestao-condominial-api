import { GroupedAppointments } from '@/domain/management/application/use-cases/fetch-appointments'
import { Assembly } from '@/domain/management/enterprise/entities/assembly'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class AppointmentPresenter {
	static toHTTP(appointment: Meeting | Assembly) {
		return {
			appointment: AppointmentPresenter.toHTTPItem(appointment),
		}
	}

	static toHTTPGrouped(appointments: GroupedAppointments<Meeting | Assembly>) {
		return {
			canceled: appointments.canceled.map(AppointmentPresenter.toHTTPItem),
			completed: appointments.completed.map(AppointmentPresenter.toHTTPItem),
			upcoming: appointments.upcoming.map(AppointmentPresenter.toHTTPItem),
		}
	}

	private static toHTTPItem(appointment: Meeting | Assembly) {
		return {
			id: appointment.id.toString(),
			condominiumId: appointment.condominiumId.toString(),
			type: appointment instanceof Meeting ? 'meeting' : 'assembly',
			title: appointment.title,
			description: appointment.description,
			scheduledAt: appointment.scheduledAt,
			canceledAt: appointment.canceledAt ?? null,
			created_at: appointment.createdAt,
			updated_at: appointment.updatedAt,
		}
	}
}
