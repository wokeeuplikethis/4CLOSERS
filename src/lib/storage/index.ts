import type { StorageDriver } from './types'
import { localStorageDriver } from './local'

let cached: StorageDriver | null = null

async function resolveDriver(): Promise<StorageDriver> {
  if (cached) return cached

  if (process.env.STORAGE_DRIVER === 'r2') {
    const { r2StorageDriver } = await import('./r2')
    cached = r2StorageDriver
  } else {
    cached = localStorageDriver
  }
  return cached
}

export const storage = {
  async upload(...args: Parameters<StorageDriver['upload']>) {
    const driver = await resolveDriver()
    return driver.upload(...args)
  },
  async delete(...args: Parameters<StorageDriver['delete']>) {
    const driver = await resolveDriver()
    return driver.delete(...args)
  },
}

export type { UploadOptions, StorageKind } from './types'