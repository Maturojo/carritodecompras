import { useState, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export function useAndreani() {
  const [cotizacion, setCotizacion] = useState(null)
  const [loadingCot, setLoadingCot] = useState(false)
  const [errorCot, setErrorCot] = useState(null)

  const cotizar = useCallback(async ({ codigoPostal, pesoTotal = 0.5, bultos = 1 }) => {
    if (!codigoPostal || codigoPostal.length < 4) return
    setLoadingCot(true)
    setErrorCot(null)
    try {
      const res = await fetch(`${API}/api/andreani-cotizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoPostalDestino: codigoPostal, pesoTotal, bultos }),
      })
      const data = await res.json()
      setCotizacion(data)
    } catch (e) {
      setErrorCot('No se pudo cotizar el envío. Intentá de nuevo.')
    } finally {
      setLoadingCot(false)
    }
  }, [])

  const crearEnvio = useCallback(async ({ orden, servicio }) => {
    const res = await fetch(`${API}/api/andreani-envio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orden, servicio }),
    })
    return res.json()
  }, [])

  const trackEnvio = useCallback(async (numero) => {
    const res = await fetch(`${API}/api/andreani-tracking?numero=${numero}`)
    return res.json()
  }, [])

  return { cotizacion, loadingCot, errorCot, cotizar, crearEnvio, trackEnvio }
}
