import type { EncodeOptions as AvifOption } from '@jsquash/avif/meta'
import type { EncodeOptions as JpegOption } from '@jsquash/jpeg/meta'
import type { WorkerResizeOptions as ResizeOption } from '@jsquash/resize/meta'
import type { EncodeOptions as WebpOption } from '@jsquash/webp/meta'

interface Jpeg {
  target: 'jpeg'
  encodeOptions?: Partial<JpegOption>
}

interface Webp {
  target: 'webp'
  encodeOptions?: Partial<WebpOption>
}

interface Avif {
  target: 'avif'
  encodeOptions?: Partial<AvifOption> & {
    bitDepth?: 8
  }
}

interface Thumbnail {
  target: 'thumbnail'
  encodeOptions?: Partial<JpegOption>
  resizeOptions?: Partial<ResizeOption> & { width: number, height: number }
}

export type CompressOptions = Jpeg | Webp | Avif | Thumbnail
export interface CompressMultiResultOption {
  jpeg?: Jpeg | boolean
  webp?: Webp | boolean
  avif?: Avif | boolean
  thumbnail?: Thumbnail | boolean
}

export interface compressFiles {
  jpeg?: File | 'loading'
  webp?: File | 'loading'
  avif?: File | 'loading'
  thumbnail?: File | 'loading'
}

export type CompressKeys = keyof compressFiles

async function decode(file: File): Promise<ImageData> {
  return decodeWorkerPool.addTask({ file })
}

async function encode(imageData: ImageData, filename: string, options?: CompressOptions): Promise<File> {
  return encodeWorkerPool.addTask({ imageData, filename, options })
}

export async function compressImage(file: File, options?: CompressOptions): Promise<File> {
  const imageData = await decode(file)
  return await encode(imageData, file.name, options)
}

export async function compressImageMultiResult(
  file: File,
  options: CompressMultiResultOption,
  completeCallback?: (type: CompressKeys, file: File) => Promise<void>,
): Promise<compressFiles> {
  const imageData = await decode(file)
  const results: compressFiles = {}
  const encodeTask = (Object.entries(options) as [CompressKeys, CompressOptions | true][]).map(async ([type, option]) => {
    if (!option)
      return
    const result = await encode(imageData, file.name, option === true ? { target: type } : option)
    results[type] = result
    await completeCallback?.(type, result)
  })
  await Promise.allSettled(encodeTask)
  return results
}
