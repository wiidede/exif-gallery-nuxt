import { encode as encodeAvif } from '@jsquash/avif'
import { encode as encodeJpeg } from '@jsquash/jpeg'
import resize from '@jsquash/resize'
import { encode as encodeWebp } from '@jsquash/webp'

globalThis.onmessage = async (e) => {
  const { imageData, filename, options }: {
    imageData: Parameters<typeof encodeJpeg>[0]
    filename: string
    options: CompressOptions
  } = e.data

  function changeFileExtension(filename: string, suffix: string, maxLength = 255) {
    const baseName = filename.replace(/\.[^.]+$/, '')
    suffix = suffix.includes('.') ? suffix : `.${suffix}`
    const maxBaseNameLength = maxLength - (suffix.length)
    return `${baseName.slice(0, maxBaseNameLength)}${suffix}`
  }

  try {
    let result: File | undefined

    if (options.target === 'jpeg') {
      const jpegData = await encodeJpeg(imageData, options.encodeOptions)
      result = new File([jpegData], changeFileExtension(filename, 'jpg'), {
        type: 'image/jpeg',
      })
    }
    else if (options.target === 'webp') {
      const webpData = await encodeWebp(imageData, options.encodeOptions)
      result = new File([webpData], changeFileExtension(filename, 'webp'), {
        type: 'image/webp',
      })
    }
    else if (options.target === 'avif') {
      const avifData = options.encodeOptions ? await encodeAvif(imageData, options.encodeOptions) : await encodeAvif(imageData)
      result = new File([avifData], changeFileExtension(filename, 'avif'), {
        type: 'image/avif',
      })
    }
    else if (options.target === 'thumbnail') {
      let thumbnailWidth = options.resizeOptions?.width
      let thumbnailHeight = options.resizeOptions?.height
      if (!thumbnailHeight && !thumbnailWidth) {
        if (imageData.width > imageData.height)
          thumbnailHeight = 240
        else
          thumbnailWidth = 320
      }
      if (!thumbnailWidth && thumbnailHeight) {
        const imageRatio = imageData.width / imageData.height
        thumbnailWidth = Math.round(thumbnailHeight * imageRatio)
      }
      if (!thumbnailHeight && thumbnailWidth) {
        const imageRatio = imageData.width / imageData.height
        thumbnailHeight = Math.round(thumbnailWidth / imageRatio)
      }
      const thumbnailData = await resize(imageData, {
        width: thumbnailWidth || 320,
        height: thumbnailHeight || 240,
        ...options.resizeOptions,
      })
      const thumbnail = await encodeJpeg(thumbnailData, options.encodeOptions)
      result = new File([thumbnail], changeFileExtension(filename, '_thumb.jpg'), {
        type: 'image/jpeg',
      })
    }

    if (!result) {
      throw new Error('Failed to encode image')
    }

    globalThis.postMessage({ success: true, result })
  }
  catch (error) {
    console.error('Encode Worker error:', error)
    globalThis.postMessage({ success: false, error })
  }
}
