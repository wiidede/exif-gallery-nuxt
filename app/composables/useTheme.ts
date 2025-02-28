export function useTheme(init = false) {
  const theme = useLocalStorage('shadcn-theme', 'zinc')
  const radius = useLocalStorage('shadcn-radius', '0.5')

  if (init && !import.meta.env.SSR) {
    watch(theme, (value) => {
      const oldClass = Array.from(document.body.classList).find(className => className.startsWith('theme-'))
      if (oldClass)
        document.body.classList.remove(oldClass)
      document.body.classList.add(`theme-${value}`)
    }, { immediate: true })

    watch(radius, (radius) => {
      document.body.style.setProperty('--radius', `${radius}rem`)
    }, { immediate: true })
  }

  return {
    theme,
    radius,
  }
}
