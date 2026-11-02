import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to the top when the pathname changes (e.g. clicking a related book).
 * Query-string-only changes (catalogue filters) keep the current scroll position.
 */
export const ScrollToTop = (): null => {
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default ScrollToTop
