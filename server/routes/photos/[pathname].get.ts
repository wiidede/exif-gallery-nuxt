import { blob } from 'hub:blob'
import { z } from 'zod'

export default eventHandler(async (event) => {
  const { pathname } = await getValidatedRouterParams(event, z.object({
    pathname: z.string().min(1),
  }).parse)

  return blob.serve(event, pathname)
})
