import { InMemoryAttachmentsRepository } from '@/test/repositories/in-memory-attachments-repository'
import { FakeUploader } from '@/test/storage/fake-uploader'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeUploader: FakeUploader

let sut: UploadAndCreateAttachmentUseCase

describe('Upload and create attachment', () => {
	beforeEach(() => {
		inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
		fakeUploader = new FakeUploader()

		sut = new UploadAndCreateAttachmentUseCase(
			inMemoryAttachmentsRepository,
			fakeUploader,
		)
	})

	it('should be able to upload and create an attachment', async () => {
		const response = await sut.execute({
			fileName: 'profile.png',
			fileType: 'image/png',
			body: Buffer.from(''),
		})

		if (response.isLeft()) {
			throw new Error('Expected success, but got error')
		}

		expect(response.isRight()).toBe(true)
		expect(response.result).toEqual({
			attachment: inMemoryAttachmentsRepository.items[0],
		})
		expect(fakeUploader.uploads).toHaveLength(1)
		expect(fakeUploader.uploads[0]).toEqual(
			expect.objectContaining({
				fileName: 'profile.png',
			}),
		)
	})

	it('should not be able to upload an attachment with invalid file type', async () => {
		const response = await sut.execute({
			fileName: 'profile.mp3',
			fileType: 'audio/mpeg',
			body: Buffer.from(''),
		})

		expect(response.isLeft()).toBe(true)
		if (response.isLeft()) {
			expect(response.reason).toBeInstanceOf(InvalidAttachmentTypeError)
		}
	})
})
