import { Attachment } from '@/domain/management/enterprise/entities/attachment'

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class AttachmentPresenter {
	static toHTTP(attachment: Attachment) {
		return {
			attachmentId: attachment.id.toString(),
		}
	}
}
