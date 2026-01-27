// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-26',
  future: { compatibilityVersion: 4 },
  modules: [
    '@nuxthub/core',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'nuxt-auth-utils',
  ],
  hub: {
    blob: {
      driver: 'cloudflare-r2',
      binding: 'BLOB',
    },
    db: {
      dialect: 'sqlite',
      driver: 'd1',
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  components: [
    {
      path: '~/components/ui',
      prefix: '',
      extensions: ['vue'],
    },
    {
      path: '~/components/inspira',
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
  runtimeConfig: {
    public: {
      title: process.env.NUXT_PUBLIC_TITLE,
      description: process.env.NUXT_PUBLIC_DESCRIPTION,
    },
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.yml' },
      { code: 'zh', iso: 'zh-CN', file: 'zh.yml' },
    ],
    defaultLocale: 'en',
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
    worker: {
      format: 'es',
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
