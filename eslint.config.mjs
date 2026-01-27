// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  // formatters: true,
  ignores: [
    'server/db/migrations/*',
  ],
  overrides: {
    typescript: {
      'node/prefer-global/process': 'off',
    },
  },
})
