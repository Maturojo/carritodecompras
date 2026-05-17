import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AnalyticsContext = createContext(null)

const INITIAL = {
  pageViews: {},
  productClicks: {},
  totalVisits: 0,
}

export function AnalyticsProvider({ children }) {
  const [data, setData] = useLocalStorage('ms_analytics', INITIAL)

  const trackPageView = useCallback((path) => {
    setData(prev => ({
      ...prev,
      totalVisits: (prev.totalVisits || 0) + 1,
      pageViews: {
        ...prev.pageViews,
        [path]: (prev.pageViews?.[path] || 0) + 1,
      },
    }))
  }, [setData])

  const trackProductClick = useCallback((productId) => {
    setData(prev => ({
      ...prev,
      productClicks: {
        ...prev.productClicks,
        [productId]: (prev.productClicks?.[productId] || 0) + 1,
      },
    }))
  }, [setData])

  const resetAnalytics = () => setData(INITIAL)

  return (
    <AnalyticsContext.Provider value={{ data, trackPageView, trackProductClick, resetAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  return useContext(AnalyticsContext)
}
