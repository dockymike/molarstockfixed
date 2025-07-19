// ✅ src/context/LowStockContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchLowStockAlerts } from '../services/LowStockThresholdService'
import { useUser } from './UserContext'

const LowStockContext = createContext()

export function LowStockProvider({ children }) {
  const { user, token } = useUser()
  const [lowStockAlerts, setLowStockAlerts] = useState([])

  const refreshLowStockAlerts = useCallback(async () => {
    if (!user || !token) return
    const alerts = await fetchLowStockAlerts(token)
    setLowStockAlerts(alerts)
  }, [user, token])

  useEffect(() => {
    refreshLowStockAlerts()
    const interval = setInterval(refreshLowStockAlerts, 60000)
    return () => clearInterval(interval)
  }, [refreshLowStockAlerts])

  return (
    <LowStockContext.Provider value={{
      lowStockAlerts,
      triggerLowStockRefresh: refreshLowStockAlerts
    }}>
      {children}
    </LowStockContext.Provider>
  )
}

export function useLowStock() {
  return useContext(LowStockContext)
}
