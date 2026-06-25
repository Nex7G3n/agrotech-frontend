import { httpClient } from '@/shared/api/httpClient'
import { notifyUnauthorized } from '@/shared/api/authSession'

import { API_URL } from '@/shared/api/apiConfig'

async function downloadPdfPost(module, payload) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_URL}/delivery/share/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ module, channel: 'pdf', payload }),
  })

  if (!response.ok) {
    if (response.status === 401) notifyUnauthorized()
    const data = await response.json().catch(() => null)
    throw new Error(typeof data?.detail === 'string' ? data.detail : 'No se pudo descargar el PDF')
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') || ''
  const match = /filename="?([^"]+)"?/i.exec(disposition)
  const filename = match?.[1] || 'agropredict-reporte.pdf'
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const deliveryService = {
  getTelegramStatus: () => httpClient.get('/delivery/telegram/status'),

  linkTelegram: (payload) => httpClient.patch('/delivery/telegram/link', payload),

  downloadPdf: (module, payload) => downloadPdfPost(module, payload),

  sendTelegram: (module, payload, chatId) =>
    httpClient.post('/delivery/share', {
      module,
      channel: 'telegram',
      payload,
      chat_id: chatId || undefined,
    }),

  sendEmail: (module, payload, emailDestination) =>
    httpClient.post('/delivery/share', {
      module,
      channel: 'email',
      payload,
      email_destination: emailDestination || undefined,
    }),

  sendWhatsApp: (module, payload, phoneDestination) =>
    httpClient.post('/delivery/share', {
      module,
      channel: 'whatsapp',
      payload,
      phone_destination: phoneDestination || undefined,
    }),

  shareBoth: (module, payload, chatId) =>
    httpClient.post('/delivery/share', {
      module,
      channel: 'both',
      payload,
      chat_id: chatId || undefined,
    }),
}
