// unocss.config.ts
import { defineConfig, presetIcons, presetWebFonts, presetWind3 } from 'unocss'
import presetAnimations from 'unocss-preset-animations'
import { builtinColors, presetShadcn } from 'unocss-preset-shadcn'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAnimations(),
    presetShadcn(builtinColors.map(color => ({ color }))),
    presetIcons({
      scale: 1.2,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Sans',
        mono: 'DM Mono',
      },
    }),
  ],
  preflights: [{
    getCSS: () => `
*, ::before, ::after { --un-default-border-color: oklch(var(--border)); }
.dark input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1); }
`,
  }],
  // By default, `.ts` and `.js` files are NOT extracted.
  // If you want to extract them, use the following configuration.
  // It's necessary to add the following configuration if you use shadcn-vue or shadcn-svelte.
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        '(components|src)/**/*.{js,ts}',
      ],
    },
  },
})
