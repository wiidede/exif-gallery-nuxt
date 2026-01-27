type ConvertNullToUndefined<T> = {
  [K in keyof T]: T[K] extends infer U ? (U extends null ? undefined : U) : never
}

// Union type to accept both Date and string for API responses
export type APIDataPhoto = Omit<Photo, 'fileModified' | 'takenAt' | 'createdAt' | 'updatedAt'>
  & {
    fileModified: Date | string | null
    takenAt: Date | string | null
    createdAt: Date | string | null
    updatedAt: Date | string | null
  }

export type IPhoto = ConvertNullToUndefined<Photo>

export type IPhotoForm = Partial<IPhoto>
