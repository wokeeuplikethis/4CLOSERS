import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { StorageDriver, UploadOptions } from './types'

const EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/mp4': '.m4a',
  'audio/ogg': '.ogg',
}

function extensionFor(file: File): string {
  if (file.type && EXT[file.type]) return EXT[file.type]
  const nameExt = file.name.match(/\.[a-z0-9]+$/i)?.[0]
  return nameExt ?? ''
}

export const localStorageDriver: StorageDriver = {
  async upload(file, options) {
    const folder = options.kind === 'avatar'
      ? 'avatars'
      : options.kind === 'image'
      ? 'images'
      : 'audio'

    const owner = options.ownerId ? `${options.ownerId}-` : ''
    const rand = options.randomize !== false ? `${randomUUID().slice(0, 8)}` : ''
    const filename = `${owner}${rand}${extensionFor(file)}`.replace(/^-+/, '')

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    const filepath = join(uploadDir, filename)

    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    return { url: `/uploads/${folder}/${filename}` }
  },

  async delete(url) {
    // Удаляем только свои локальные файлы
    if (!url.startsWith('/uploads/')) return
    const path = join(process.cwd(), 'public', url)
    unlink(path).catch(() => {})
  },
}