"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"

declare global {
  interface Window { paypal?: { Buttons: (options: Record<string, unknown>) => { render: (element: HTMLElement) => Promise<void> } } }
}

export function PayPalButton({ bookingId }: { bookingId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/paypal/config").then((r) => r.json()).then(({ clientId, mode }) => {
      if (!clientId) throw new Error("PayPal no está configurado")
      const script = document.createElement("script")
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR&intent=capture&components=buttons`
      script.async = true
      script.onload = () => { if (!cancelled) setReady(true) }
      script.onerror = () => setError("No se pudo cargar PayPal")
      document.head.appendChild(script)
      void mode
    }).catch((e) => setError(e instanceof Error ? e.message : "Error al cargar PayPal"))
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready || !window.paypal || !containerRef.current) return
    containerRef.current.innerHTML = ""
    window.paypal.Buttons({
      createOrder: async () => {
        const response = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "No se pudo crear la orden")
        return data.orderId
      },
      onApprove: async (data: { orderID: string }) => {
        const response = await fetch("/api/paypal/capture-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, orderId: data.orderID }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "PayPal no confirmó el pago")
        window.location.href = `/pago/exito?bookingId=${encodeURIComponent(bookingId)}`
      },
      onCancel: () => setError("Has cancelado el pago de PayPal. Puedes intentarlo de nuevo."),
      onError: (e: Error) => setError(e.message || "PayPal no pudo procesar el pago"),
    }).render(containerRef.current)
  }, [ready, bookingId])

  return <div className="space-y-3">
    {error && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
    {!ready && !error && <Button disabled className="w-full"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando PayPal...</Button>}
    <div ref={containerRef} />
  </div>
}
