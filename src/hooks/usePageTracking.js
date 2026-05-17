import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAnalytics } from '../context/AnalyticsContext'

export function usePageTracking() {
  const location = useLocation()
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    // No trackear rutas del admin
    if (!location.pathname.startsWith('/admin')) {
      trackPageView(location.pathname)
    }
  }, [location.pathname])
}
