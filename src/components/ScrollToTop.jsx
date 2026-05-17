import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageTracking } from '../hooks/usePageTracking'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  usePageTracking()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
