// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-30',
  future: { compatibilityVersion: 4 },
  modules: [
    '@nuxthub/core',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'nuxt-auth-utils',
  ],
  hub: {
    blob: true,
    database: true,
  },
  components: [
    {
      path: '~/components/ui',
      prefix: '',
      extensions: ['vue'],
    },
    '~/components',
  ],
  imports: {
    presets: [
      { from: 'vue-sonner', imports: ['toast'] },
    ],
  },
  css: [
    '@unocss/reset/tailwind.css',
  ],
  colorMode: {
    classSuffix: '',
  },
  experimental: {
    viewTransition: true,
  },
  devtools: { enabled: true },
  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
  build: {
    transpile: [/@jsquash\//],
  },
  vite: {
    optimizeDeps: {
      exclude: ['@jsquash/avif', '@jsquash/jpeg', '@jsquash/png', '@jsquash/resize', '@jsquash/webp'],
    },
    plugins: [
      {
        name: 'expose-theme',
        transform(src, id) {
          if (id.includes('unocss-preset-shadcn')) {
            return {
              code: `${src}\nexport { theme };\n`,
            }
          }
        },
      },
    ],
  },
})
