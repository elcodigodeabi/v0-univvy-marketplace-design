"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Printer, Shield, CheckCircle, XCircle } from "lucide-react"

export interface ReceiptData {
  id: string
  subject: string | null
  title: string
  scheduledAt: string
  durationMinutes: number
  advisorName: string
  studentName: string
  referenceId: string | null
  payment: {
    status: string
    amount: number
    platformFee: number
    advisorAmount: number
    currency: string
    createdAt: string
    escrowReleasedAt: string | null
    refundedAt: string | null
    refundReason: string | null
  } | null
}

const PAYMENT_STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700 border-0" },
  in_escrow: { label: "En garantía", className: "bg-blue-100 text-blue-700 border-0" },
  released: { label: "Liberado al asesor", className: "bg-green-100 text-green-700 border-0" },
  refunded: { label: "Reembolsado", className: "bg-gray-100 text-gray-700 border-0" },
  failed: { label: "Fallido", className: "bg-red-100 text-red-700 border-0" },
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(cents / 100)
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  })
}

export function PaymentReceipt({ receipt, showPrint = true }: { receipt: ReceiptData; showPrint?: boolean }) {
  const statusCfg = receipt.payment
    ? PAYMENT_STATUS_LABEL[receipt.payment.status] || { label: receipt.payment.status, className: "bg-gray-100 text-gray-700 border-0" }
    : null

  return (
    <div id="receipt-print-area" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Comprobante de pago</p>
          <p className="font-semibold text-gray-900">{receipt.subject || receipt.title}</p>
        </div>
        {statusCfg && <Badge className={statusCfg.className}>{statusCfg.label}</Badge>}
      </div>

      <Separator />

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Asesor</dt>
        <dd className="text-right text-gray-900">{receipt.advisorName}</dd>
        <dt className="text-muted-foreground">Alumno</dt>
        <dd className="text-right text-gray-900">{receipt.studentName}</dd>
        <dt className="text-muted-foreground">Fecha de la sesión</dt>
        <dd className="text-right text-gray-900">{formatDateTime(receipt.scheduledAt)}</dd>
        <dt className="text-muted-foreground">Duración</dt>
        <dd className="text-right text-gray-900">{receipt.durationMinutes} min</dd>
      </dl>

      {receipt.payment && (
        <>
          <Separator />
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Monto total</dt>
            <dd className="text-right font-semibold text-gray-900">
              {formatMoney(receipt.payment.amount, receipt.payment.currency)}
            </dd>
            <dt className="text-muted-foreground">Comisión de la plataforma</dt>
            <dd className="text-right text-gray-900">
              {formatMoney(receipt.payment.platformFee, receipt.payment.currency)}
            </dd>
            <dt className="text-muted-foreground">Monto para el asesor</dt>
            <dd className="text-right text-gray-900">
              {formatMoney(receipt.payment.advisorAmount, receipt.payment.currency)}
            </dd>
            <dt className="text-muted-foreground">Fecha de pago</dt>
            <dd className="text-right text-gray-900">{formatDateTime(receipt.payment.createdAt)}</dd>
            {receipt.payment.escrowReleasedAt && (
              <>
                <dt className="text-muted-foreground">Liberado el</dt>
                <dd className="text-right text-gray-900">{formatDateTime(receipt.payment.escrowReleasedAt)}</dd>
              </>
            )}
            {receipt.payment.refundedAt && (
              <>
                <dt className="text-muted-foreground">Reembolsado el</dt>
                <dd className="text-right text-gray-900">{formatDateTime(receipt.payment.refundedAt)}</dd>
              </>
            )}
          </dl>
        </>
      )}

      {receipt.referenceId && (
        <p className="text-xs text-muted-foreground break-all">
          Referencia: {receipt.referenceId}
        </p>
      )}

      {receipt.payment?.status === "in_escrow" && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Este pago está en garantía hasta que ambas partes confirmen que la clase se realizó.</span>
        </div>
      )}
      {receipt.payment?.status === "released" && (
        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-800">
          <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>El pago fue liberado al asesor tras confirmar ambas partes la sesión.</span>
        </div>
      )}
      {receipt.payment?.status === "refunded" && (
        <div className="flex items-start gap-2 p-3 bg-gray-100 rounded-lg text-sm text-gray-700">
          <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Este pago fue reembolsado al alumno.</span>
        </div>
      )}

      {showPrint && (
        <Button
          variant="outline"
          className="w-full print:hidden"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir comprobante
        </Button>
      )}
    </div>
  )
}
