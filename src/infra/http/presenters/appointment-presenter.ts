import { GroupedAppointments } from '@/domain/management/application/use-cases/fetch-appointments'
import { Assembly } from '@/domain/management/enterprise/entities/assembly'
import { Meeting } from '@/domain/management/enterprise/entities/meeting'
import { AppointmentWithType } from '@/domain/management/enterprise/entities/value-objects/appointment-with-type'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class AppointmentPresenter {
	static toHTTP(appointment: Meeting | Assembly) {
		return {
			appointment: AppointmentPresenter.toHTTPItem(appointment),
		}
	}

	static toHTTPGrouped(appointments: GroupedAppointments<AppointmentWithType>) {
		return {
			canceled: appointments.canceled.map(AppointmentPresenter.toHTTPListItem),
			completed: appointments.completed.map(
				AppointmentPresenter.toHTTPListItem,
			),
			upcoming: appointments.upcoming.map(AppointmentPresenter.toHTTPListItem),
		}
	}

	private static toHTTPListItem(appointment: AppointmentWithType) {
		return {
			id: appointment.appointmentId.toString(),
			condominiumId: appointment.condominiumId.toString(),
			type: appointment.type,
			title: appointment.title,
			scheduledAt: appointment.scheduledAt,
			canceledAt: appointment.canceledAt ?? null,
			created_at: appointment.createdAt,
			updated_at: appointment.updatedAt,
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
