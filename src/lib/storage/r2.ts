import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import type { StorageDriver } from './types'

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
  return file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ''
}

const accountId = process.env.R2_ACCOUNT_ID!
const accessKeyId = process.env.R2_ACCESS_KEY_ID!
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!
const bucket = process.env.R2_BUCKET_NAME!
const publicUrl = process.env.R2_PUBLIC_URL! // напр. https://cdn.example.com

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
})

export const r2StorageDriver: StorageDriver = {
  async upload(file, options) {
    const folder = options.kind === 'avatar'
      ? 'avatars'
      : options.kind === 'image'
      ? 'images'
      : 'audio'

    const owner = options.ownerId ? `${options.ownerId}-` : ''
    const rand = options.randomize !== false ? randomUUID().slice(0, 8) : ''
    const key = `${folder}/${owner}${rand}${extensionFor(file)}`.replace(/-+\./, '.')

    const buffer = Buffer.from(await file.arrayBuffer())

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    )

    return { url: `${publicUrl}/${key}` }
  },

  async delete(url) {
    if (!url.startsWith(publicUrl)) return
    const key = url.slice(publicUrl.length + 1)
    try {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    } catch {
      // тихо
    }
  },
}