import { useState, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export function useShipping() {
  const [opciones, setOpciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Cotiza con Andreani y Correo Argentino en paralelo
   * y combina los resultados en una sola lista ordenada por precio.
   */
  const cotizar = useCallback(async ({ codigoPostal, pesoTotal = 0.5 }) => {
    if (!codigoPostal || codigoPostal.length < 4) return

    setLoading(true)
    setError(null)
    setOpciones([])

    const payload = JSON.stringify({
      codigoPostalDestino: codigoPostal,
      pesoTotal,
      pesoGramos: Math.round(pesoTotal * 1000),
    })

    const headers = { 'Content-Type': 'application/json' }

    // Llamamos a las dos APIs en paralelo, sin que el fallo de una rompa la otra
    const [andreaniRes, correoRes] = await Promise.allSettled([
      fetch(`${API}/api/andreani-cotizar`, { method: 'POST', headers, body: payload }).then(r => r.json()),
      fetch(`${API}/api/correo-cotizar`,   { method: 'POST', headers, body: payload }).then(r => r.json()),
    ])

    const servicios = []

    if (andreaniRes.status === 'fulfilled' && andreaniRes.value?.servicios) {
      andreaniRes.value.servicios.forEach(s =>
        servicios.push({ ...s, proveedor: 'andreani', mock: andreaniRes.value.mock })
      )
    }

    if (correoRes.status === 'fulfilled' && correoRes.value?.servicios) {
      correoRes.value.servicios.forEach(s =>
        servicios.push({ ...s, proveedor: 'correo', mock: correoRes.value.mock })
      )
    }

    if (servicios.length === 0) {
      setError('No pudimos obtener opciones de envío. Intentá de nuevo.')
    } else {
      // Ordenar por precio ascendente
      servicios.sort((a, b) => a.precio - b.precio)
    }

    setOpciones(servicios)
    setLoading(false)
  }, [])

  /** Crea el envío según el proveedor elegido */
  const crearEnvio = useCallback(async ({ orden, servicio }) => {
    const endpoint = servicio.proveedor === 'correo'
      ? `${API}/api/correo-envio`
      : `${API}/api/andreani-envio`

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orden, servicio: servicio.nombre }),
    })
    return res.json()
  }, [])

  /** Tracking según el proveedor */
  const trackEnvio = useCallback(async ({ numeroEnvio, proveedor }) => {
    const endpoint = proveedor === 'correo'
      ? `${API}/api/correo-tracking?numero=${numeroEnvio}`
      : `${API}/api/andreani-tracking?numero=${numeroEnvio}`

    const res = await fetch(endpoint)
    return res.json()
  }, [])

  return { opciones, loading, error, cotizar, crearEnvio, trackEnvio }
}
