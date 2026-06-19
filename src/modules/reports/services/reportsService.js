import { httpClient } from '@/shared/api/httpClient'
import { notifyUnauthorized } from '@/shared/api/authSession'

import { API_URL } from '@/shared/api/apiConfig'

function buildCyclesQuery({ yearFrom, yearTo, destination, continent } = {}) {
  const params = new URLSearchParams()
  if (yearFrom) params.append('year_from', yearFrom)
  if (yearTo) params.append('year_to', yearTo)
  if (destination && destination !== 'Todos') params.append('destination', destination)
  if (continent && continent !== 'Todos') params.append('continent', continent)
  return params.toString()
}

function parseFilename(contentDisposition) {
  if (!contentDisposition) return 'agropredict-reporte-ciclos.pdf'
  const match = /filename="?([^"]+)"?/i.exec(contentDisposition)
  return match?.[1] || 'agropredict-reporte-ciclos.pdf'
}

async function downloadPdf(path) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    if (response.status === 401) {
      notifyUnauthorized()
    }
    const data = await response.json().catch(() => null)
    const detail = data?.detail
    throw new Error(typeof detail === 'string' ? detail : 'No se pudo descargar el PDF')
  }

  const blob = await response.blob()
  const filename = parseFilename(response.headers.get('Content-Disposition'))
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const reportsService = {
  getCyclesReport: (filters = {}) => {
    const query = buildCyclesQuery(filters)
    return httpClient.get(`/reports/cycles${query ? `?${query}` : ''}`)
  },

  downloadCyclesPdf: (filters = {}) => {
    const query = buildCyclesQuery(filters)
    return downloadPdf(`/reports/cycles/pdf${query ? `?${query}` : ''}`)
  },
}
