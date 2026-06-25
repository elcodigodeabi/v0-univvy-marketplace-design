"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Building2,
  Copy,
  CheckCheck,
  Upload,
  Clock,
  Shield,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import { getBankTransferStatus, uploadTransferProof } from "@/app/actions/bank-transfer"
import { createClient } from "@/lib/supabase/client"

interface BankTransfer {
  id: string
  status: string
  transfer_reference: string
  amount_cents: number
  platform_fee_cents: number
  advisor_amount_cents: number
  bank_name: string
  bank_iban: string
  bank_account_holder: string
  bank_swift: string
  proof_url: string | null
  proof_uploaded_at: string | null
  rejection_reason: string | null
}

interface Booking {
  id: string
  scheduled_at: string
  duration_minutes: number
  title: string
  advisor_name: string
  modalidad: string
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(`${label} copiado`)
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
      title={`Copiar ${label}`}
    >
      {copied ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

export default function BankTransferPage() {
  const params = useParams<{ bookingId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const transferId = searchParams.get("transferId") || ""

  const [transfer, setTransfer] = useState<BankTransfer | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [transferDate, setTransferDate] = useState("")
  const [transferTime, setTransferTime] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()

        // Fetch booking
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("id, scheduled_at, duration_minutes, title, advisor_name, modalidad")
          .eq("id", params.bookingId)
          .single()

        if (bookingData) setBooking(bookingData)

        // Fetch transfer
        const transferData = await getBankTransferStatus(params.bookingId)
        if (transferData) {
          setTransfer(transferData as BankTransfer)
          if (
            transferData.status === "proof_uploaded" ||
            transferData.status === "validated"
          ) {
            setSubmitted(true)
          }
        }
      } catch (err) {
        console.error("[BankTransferPage] load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.bookingId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProofFile(file)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setProofPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setProofPreview(null)
    }
  }

  const handleSubmitProof = async () => {
    if (!proofFile || !transferDate || !transfer) {
      toast.error("Por favor completa la fecha y adjunta el comprobante")
      return
    }

    setUploading(true)
    try {
      // Upload file to Blob
      const formData = new FormData()
      formData.append("file", proofFile)

      const uploadRes = await fetch("/api/upload/transfer-proof", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || "Error al subir el comprobante")
      }

      const { url: proofUrl } = await uploadRes.json()

      // Save in Supabase
      await uploadTransferProof({
        transferId: transfer.id,
        bookingId: params.bookingId,
        proofUrl,
        transferDate,
        transferTime: transferTime || undefined,
      })

      setSubmitted(true)
      toast.success("Comprobante enviado correctamente. Lo validaremos en breve.")
    } catch (err: any) {
      toast.error(err.message || "Error al enviar el comprobante")
    } finally {
      setUploading(false)
    }
  }

  const formatEUR = (cents: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">No se encontró la transferencia.</p>
          <Button asChild className="mt-4 bg-red-600 hover:bg-red-700 text-white">
            <Link href="/mis-sesiones">Ir a mis sesiones</Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-gray-600">
            <Link href="/mis-sesiones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Mis sesiones
            </Link>
          </Button>
          <Link href="/">
            <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
          </Link>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4 text-green-600" />
            Pago seguro en euros
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Transferencia bancaria</h1>
          <p className="text-gray-600 mt-1">
            Realiza la transferencia con los datos a continuación y luego sube el comprobante.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Bank details + proof upload */}
          <div className="lg:col-span-3 space-y-6">

            {/* Status banner */}
            {transfer.status === "validated" && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Transferencia validada</p>
                  <p className="text-sm text-green-700">Tu reserva ha sido confirmada. Ya puedes ver el detalle en Mis sesiones.</p>
                </div>
              </div>
            )}

            {transfer.status === "proof_uploaded" && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800">Comprobante recibido — pendiente de validación</p>
                  <p className="text-sm text-amber-700">Revisaremos tu comprobante en un plazo máximo de 24 horas hábiles.</p>
                </div>
              </div>
            )}

            {transfer.status === "rejected" && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Comprobante rechazado</p>
                  {transfer.rejection_reason && (
                    <p className="text-sm text-red-700 mt-0.5">{transfer.rejection_reason}</p>
                  )}
                  <p className="text-sm text-red-700 mt-1">Por favor vuelve a subir un comprobante válido.</p>
                </div>
              </div>
            )}

            {/* Bank account details */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Building2 className="h-5 w-5 text-red-600" />
                  Datos bancarios para la transferencia
                </CardTitle>
                <CardDescription>
                  Realiza la transferencia exactamente por el importe indicado y usa la referencia como concepto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reference (most important — highlight it) */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Concepto / Referencia obligatoria</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-red-800 tracking-widest font-mono">
                      {transfer.transfer_reference}
                    </span>
                    <CopyButton text={transfer.transfer_reference} label="Referencia" />
                  </div>
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Incluye esta referencia como concepto o descripción de la transferencia para identificarla.
                  </p>
                </div>

                {/* Bank fields */}
                {[
                  { label: "Titular de la cuenta", value: transfer.bank_account_holder },
                  { label: "IBAN", value: transfer.bank_iban, mono: true },
                  { label: "BIC / SWIFT", value: transfer.bank_swift, mono: true },
                  { label: "Banco", value: transfer.bank_name },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className={`font-medium text-gray-900 ${mono ? "font-mono tracking-wide" : ""}`}>{value}</p>
                    </div>
                    <CopyButton text={value} label={label} />
                  </div>
                ))}

                {/* Amount */}
                <div className="flex items-center justify-between pt-2 border-t-2 border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Importe a transferir</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatEUR(transfer.amount_cents)}
                    </p>
                  </div>
                  <CopyButton
                    text={(transfer.amount_cents / 100).toFixed(2)}
                    label="Importe"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Proof upload */}
            {transfer.status !== "validated" && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Upload className="h-5 w-5 text-red-600" />
                    Sube el comprobante de pago
                  </CardTitle>
                  <CardDescription>
                    Una vez realizada la transferencia, sube el justificante para agilizar la validación.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submitted && transfer.status !== "rejected" ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                      <p className="font-semibold text-gray-900">Comprobante enviado correctamente</p>
                      <p className="text-sm text-gray-600">Lo revisaremos en un plazo máximo de 24 horas hábiles.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="transfer-date" className="text-gray-900">
                            Fecha de la transferencia <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="transfer-date"
                            type="date"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                            className="border-gray-300"
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="transfer-time" className="text-gray-900">
                            Hora aproximada (opcional)
                          </Label>
                          <Input
                            id="transfer-time"
                            type="time"
                            value={transferTime}
                            onChange={(e) => setTransferTime(e.target.value)}
                            className="border-gray-300"
                          />
                        </div>
                      </div>

                      {/* File drop zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                          proofFile
                            ? "border-green-400 bg-green-50"
                            : "border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        {proofFile ? (
                          <div className="flex flex-col items-center gap-2">
                            {proofPreview ? (
                              <img
                                src={proofPreview}
                                alt="Vista previa"
                                className="max-h-40 rounded-lg object-contain"
                              />
                            ) : (
                              <FileText className="h-10 w-10 text-gray-500" />
                            )}
                            <p className="font-medium text-gray-900">{proofFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(proofFile.size / 1024).toFixed(0)} KB — Haz clic para cambiar
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-10 w-10 text-gray-400" />
                            <p className="font-medium text-gray-700">Haz clic o arrastra el comprobante</p>
                            <p className="text-sm text-gray-500">JPG, PNG, WEBP o PDF — máx. 5 MB</p>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        size="lg"
                        onClick={handleSubmitProof}
                        disabled={uploading || !proofFile || !transferDate}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando comprobante...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar comprobante
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking summary */}
            {booking && (
              <Card className="border-gray-200 sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900">Resumen de la reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Asesor</p>
                      <p className="font-semibold text-gray-900">{booking.advisor_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha y hora</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.scheduled_at)}</p>
                      <p className="text-sm text-gray-600">{formatTime(booking.scheduled_at)} · {booking.duration_minutes} min</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Asesoría</span>
                      <span>{formatEUR(transfer.advisor_amount_cents)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Comisión plataforma (10%)</span>
                      <span>{formatEUR(transfer.platform_fee_cents)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-red-600">{formatEUR(transfer.amount_cents)}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="pt-1">
                    <Badge
                      className={
                        transfer.status === "validated"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : transfer.status === "proof_uploaded"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : transfer.status === "rejected"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }
                      variant="outline"
                    >
                      {transfer.status === "pending" && "Pendiente de pago"}
                      {transfer.status === "proof_uploaded" && "Comprobante enviado"}
                      {transfer.status === "validated" && "Validado"}
                      {transfer.status === "rejected" && "Rechazado"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-5">
                <p className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Instrucciones
                </p>
                <ol className="space-y-2 text-sm text-blue-800">
                  {[
                    "Accede a tu banco (app o web) y realiza una transferencia SEPA.",
                    `Introduce el IBAN y el importe exacto: ${formatEUR(transfer.amount_cents)}.`,
                    `Escribe el concepto: ${transfer.transfer_reference}`,
                    "Descarga o captura el justificante de la transferencia.",
                    "Sube el comprobante en esta página para agilizar la validación.",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
