// https://github.com/unocss-community/unocss-preset-shadcn/blob/main/src/themes/v4.ts
// themes.map(i => ({name: i.name, label: i.label, primary: i.cssVars.light.primary, primaryDark: i.cssVars.dark.primary}))

type Color
  = | 'zinc'
    | 'slate'
    | 'stone'
    | 'gray'
    | 'neutral'
    | 'red'
    | 'rose'
    | 'orange'
    | 'green'
    | 'blue'
    | 'yellow'
    | 'violet'

// Create an array of color values
export const allColors: Color[] = [
  'zinc',
  'slate',
  'stone',
  'gray',
  'neutral',
  'red',
  'rose',
  'orange',
  'green',
  'blue',
  'yellow',
  'violet',
]

export const RADII = ['0', '0.3', '0.5', '0.75', '1']

export const baseColors = [
  { name: 'zinc', label: 'Zinc', primary: '0.21 0.006 285.885', primaryDark: '0.92 0.004 286.32' },
  { name: 'slate', label: 'Slate', primary: '0.208 0.042 265.755', primaryDark: '0.929 0.013 255.508' },
  { name: 'stone', label: 'Stone', primary: '0.216 0.006 56.043', primaryDark: '0.923 0.003 48.717' },
  { name: 'gray', label: 'Gray', primary: '0.21 0.034 264.665', primaryDark: '0.928 0.006 264.531' },
  { name: 'neutral', label: 'Neutral', primary: '0.205 0 0', primaryDark: '0.922 0 0' },
  { name: 'red', label: 'Red', primary: '0.637 0.237 25.331', primaryDark: '0.637 0.237 25.331' },
  { name: 'rose', label: 'Rose', primary: '0.645 0.246 16.439', primaryDark: '0.645 0.246 16.439' },
  { name: 'orange', label: 'Orange', primary: '0.705 0.213 47.604', primaryDark: '0.646 0.222 41.116' },
  { name: 'green', label: 'Green', primary: '0.723 0.219 149.579', primaryDark: '0.696 0.17 162.48' },
  { name: 'blue', label: 'Blue', primary: '0.623 0.214 259.815', primaryDark: '0.546 0.245 262.881' },
  { name: 'yellow', label: 'Yellow', primary: '0.795 0.184 86.047', primaryDark: '0.795 0.184 86.047' },
  { name: 'violet', label: 'Violet', primary: '0.606 0.25 292.717', primaryDark: '0.541 0.281 293.009' },
] as const

export type BaseColor = (typeof baseColors)[number]
