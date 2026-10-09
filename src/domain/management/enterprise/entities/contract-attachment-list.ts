import { WatchedList } from '@/core/entities/watched-list'
import type { ContractAttachment } from './contract-attachment'

export class ContractAttachmentList extends WatchedList<ContractAttachment> {
  compareItems(a: ContractAttachment, b: ContractAttachment): boolean {
    return a.attachmentId.equals(b.attachmentId)
  }
}