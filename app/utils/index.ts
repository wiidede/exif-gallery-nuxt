import type { SerializeObject } from 'nitropack'
import type { APIDataPhoto } from './types'

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function formatFileSize(bytes: number, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh)
    return `${bytes} B`

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return `${bytes.toFixed(dp)} ${units[u]}`
}

export const toFixed = (num: number, n = 4) => Number(num.toFixed(n)).toString()

export function formatExposureTime(exposureTime: number) {
  return exposureTime < 1
    ? `1/${Math.floor(1 / exposureTime)}`
    : `${exposureTime}`
}

export function formatExposure(p: IPhotoForm): string[] {
  return [
    `ƒ/${p.fNumber || '--'}`,
    `${p.exposureTime ? formatExposureTime(p.exposureTime) : '--'}s`,
    `ISO ${p.iso || '--'}`,
  ]
}

export function formatCameraText(p: IPhotoForm) {
  // Remove 'Corporation' from makes like 'Nikon Corporation'
  const make = p.make?.replace(/ Corporation/i, '')
  // Remove potential duplicate make from model
  const model = p.model?.replace(`${make} `, '')
  return [make, model].filter(Boolean).join(' ') || '--'
}

export function formatLensText(p: IPhotoForm) {
  return p.lensModel || '--'
}

export async function getCompressedImageBase64(file: File, compress: boolean): Promise<string> {
  if (compress) {
    file = await compressImage(file, {
      target: 'thumbnail',
    })
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function deserializePhoto(p: SerializeObject<APIDataPhoto>): IPhoto {
  return {
    ...(Object.fromEntries(Object.entries(p).map(([key, value]) => [key, value ?? undefined])) as unknown as IPhoto),
    fileModified: p.fileModified ? new Date(p.fileModified) : undefined,
    takenAt: p.takenAt ? new Date(p.takenAt) : undefined,
    createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
  } as IPhoto
}
