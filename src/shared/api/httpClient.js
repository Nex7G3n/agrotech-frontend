import { notifyUnauthorized } from './authSession'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function formatApiError(data) {
  if (!data?.detail) return 'Error de red'
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join('; ')
  }
  return String(data.detail)
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = formatApiError(data)
    if (response.status === 401) {
      notifyUnauthorized()
    }
    throw new Error(message)
  }

  return data
}

export const httpClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
