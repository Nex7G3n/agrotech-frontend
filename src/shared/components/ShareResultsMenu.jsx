import { useState } from 'react'
import { Download, Loader2, Send, Mail, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { deliveryService } from '@/shared/services/deliveryService'

export function ShareResultsMenu({
  module,
  buildPayload,
  disabled = false,
  labelPdf = 'Descargar PDF',
  labelTelegram = 'Telegram',
  labelEmail = 'Correo',
  labelWhatsApp = 'WhatsApp',
}) {
  const { user } = useAuth()
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingTg, setLoadingTg] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingWa, setLoadingWa] = useState(false)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [chatId, setChatId] = useState(user?.telegram_chat_id || '')
  const [emailDest, setEmailDest] = useState(user?.email || '')
  const [phoneDest, setPhoneDest] = useState('')
  
  const [showLink, setShowLink] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [showWaInput, setShowWaInput] = useState(false)

  const runPdf = async () => {
    setLoadingPdf(true)
    setError('')
    setSuccess('')
    try {
      await deliveryService.downloadPdf(module, buildPayload())
      setSuccess('PDF descargado con éxito.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingPdf(false)
    }
  }

  const runTelegram = async () => {
    setLoadingTg(true)
    setError('')
    setSuccess('')
    try {
      if (chatId && chatId !== user?.telegram_chat_id) {
        await deliveryService.linkTelegram({ telegram_chat_id: chatId, telegram_opt_in: true })
      }
      const response = await deliveryService.sendTelegram(module, buildPayload(), chatId || undefined)
      setSuccess(response.message || 'Enviado por Telegram con éxito.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingTg(false)
    }
  }

  const runEmail = async () => {
    if (!emailDest.trim()) {
      setError('Por favor, ingresa un correo de destino.')
      return
    }
    setLoadingEmail(true)
    setError('')
    setSuccess('')
    try {
      const response = await deliveryService.sendEmail(module, buildPayload(), emailDest)
      setSuccess(response.message || `Enviado al correo ${emailDest} con éxito.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingEmail(false)
    }
  }

  const runWhatsApp = async () => {
    if (!phoneDest.trim()) {
      setError('Por favor, ingresa un número de teléfono.')
      return
    }
    setLoadingWa(true)
    setError('')
    setSuccess('')
    try {
      const response = await deliveryService.sendWhatsApp(module, buildPayload(), phoneDest)
      setSuccess(response.message || `Enviado por WhatsApp a ${phoneDest}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingWa(false)
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

        <Button type="button" variant="secondary" size="sm" className="gap-2" disabled={disabled || loadingEmail} onClick={() => {
          setShowEmailInput((v) => !v)
          setShowLink(false)
          setShowWaInput(false)
        }}>
          {loadingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {labelEmail}
        </Button>

        <Button type="button" variant="secondary" size="sm" className="gap-2" disabled={disabled || loadingWa} onClick={() => {
          setShowWaInput((v) => !v)
          setShowLink(false)
          setShowEmailInput(false)
        }}>
          {loadingWa ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
          {labelWhatsApp}
        </Button>

        <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => {
          setShowLink((v) => !v)
          setShowEmailInput(false)
          setShowWaInput(false)
        }}>
          {showLink ? 'Ocultar Telegram' : 'Vincular Telegram'}
        </Button>
      </div>

      {showLink ? (
        <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground max-w-md animate-in fade-in duration-200">
          <p className="mb-2">1. Abre tu bot en Telegram y envía <strong>/start</strong></p>
          <p className="mb-2">2. Pega aquí tu chat_id (número que te devuelve el bot o @userinfobot)</p>
          <Input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="Ej. 123456789" className="h-8 text-xs" />
        </div>
      ) : null}

      {showEmailInput ? (
        <div className="flex gap-2 max-w-md animate-in fade-in duration-200">
          <Input value={emailDest} onChange={(e) => setEmailDest(e.target.value)} placeholder="ejemplo@correo.com" className="h-8 text-xs flex-1" />
          <Button size="sm" className="h-8 text-xs" onClick={runEmail} disabled={loadingEmail}>Enviar</Button>
        </div>
      ) : null}

      {showWaInput ? (
        <div className="flex gap-2 max-w-md animate-in fade-in duration-200">
          <Input value={phoneDest} onChange={(e) => setPhoneDest(e.target.value)} placeholder="Ej: +51987654321" className="h-8 text-xs flex-1" />
          <Button size="sm" className="h-8 text-xs" onClick={runWhatsApp} disabled={loadingWa}>Enviar</Button>
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-600 font-semibold">{error}</p> : null}
      {success ? <p className="text-xs text-ag-green-600 font-semibold">{success}</p> : null}
    </div>
  )
}
