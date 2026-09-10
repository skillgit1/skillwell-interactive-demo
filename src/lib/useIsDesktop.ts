import { useEffect, useState } from 'react'

/**
 * True on desktop-width viewports (>= 1024px by default). The split-screen
 * onboarding (map beside the questions) is desktop-only; below this width the
 * app keeps the existing full-screen intro modal, since the side-by-side layout
 * does not work on a phone.
 */
export function useIsDesktop(query = '(min-width: 1024px)'): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return isDesktop
}
