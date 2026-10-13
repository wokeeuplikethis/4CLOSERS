export type StorageKind = 'avatar' | 'image' | 'audio'

export interface UploadOptions {
  kind: StorageKind
  /** Опциональный ID владельца (userId, artistId) — попадёт в путь. */
  ownerId?: string
  /** Если true — сгенерируется уникальное имя (uuid). По умолчанию true. */
  randomize?: boolean
}

export interface StorageDriver {
  upload(file: File, options: UploadOptions): Promise<{ url: string }>
  delete(url: string): Promise<void>
}