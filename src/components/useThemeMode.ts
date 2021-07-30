import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function useThemeMode() {
  const [mounted, setMounted] = useState(false)
  const themeObject = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Need to wait for mount because we cannot know the theme on the server, many of the values returned from useTheme will be undefined until mounted on the client
  // Created custom hook, otherwise, will have to do this null check in every single file that useTheme is used
  if (!mounted) return { theme: null, resolvedTheme: null, setTheme: null }
  return themeObject
}
