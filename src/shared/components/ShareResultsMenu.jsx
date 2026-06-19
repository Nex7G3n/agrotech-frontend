import { useState } from 'react'
import { Download, Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { deliveryService } from '@/shared/services/deliveryService'

export function ShareResultsMenu({
  module,
  buildPayload,
  disabled = false,
  labelPdf = 'Descargar PDF',
  labelTelegram = 'Enviar Telegram',
}) {
  const { user } = useAuth()
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingTg, setLoadingTg] = useState(false)
  const [error, setError] = useState('')
  const [chatId, setChatId] = useState(user?.telegram_chat_id || '')
  const [showLink, setShowLink] = useState(false)

  const runPdf = async () => {
    setLoadingPdf(true)
    setError('')
    try {
      await deliveryService.downloadPdf(module, buildPayload())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingPdf(false)
    }
  }

  const runTelegram = async () => {
    setLoadingTg(true)
    setError('')
    try {
      if (chatId && chatId !== user?.telegram_chat_id) {
        await deliveryService.linkTelegram({ telegram_chat_id: chatId, telegram_opt_in: true })
      }
      await deliveryService.sendTelegram(module, buildPayload(), chatId || undefined)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingTg(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" className="gap-2" disabled={disabled || loadingPdf} onClick={runPdf}>
          {loadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {labelPdf}
        </Button>
        <Button type="button" variant="secondary" size="sm" className="gap-2" disabled={disabled || loadingTg} onClick={runTelegram}>
          {loadingTg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {labelTelegram}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setShowLink((v) => !v)}>
          {showLink ? 'Ocultar Telegram' : 'Vincular Telegram'}
        </Button>
      </div>
      {showLink ? (
        <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          <p className="mb-2">1. Abre tu bot en Telegram y envía <strong>/start</strong></p>
          <p className="mb-2">2. Pega aquí tu chat_id (número que te devuelve el bot o @userinfobot)</p>
          <Input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="Ej. 123456789" className="h-8 text-xs" />
        </div>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
