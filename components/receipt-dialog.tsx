"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Receipt, Loader2 } from "lucide-react"
import { getBookingReceipt } from "@/app/actions/bookings"
import { PaymentReceipt, type ReceiptData } from "@/components/payment-receipt"

export function ReceiptDialog({
  bookingId,
  variant = "outline",
  className,
}: {
  bookingId: string
  variant?: "outline" | "ghost" | "default"
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next && !receipt) {
      setLoading(true)
      setError(false)
      getBookingReceipt(bookingId)
        .then((data) => setReceipt(data as ReceiptData))
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <Receipt className="h-4 w-4 mr-2" />
          Ver comprobante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comprobante de pago</DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        )}
        {!loading && error && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No pudimos cargar el comprobante. Intenta de nuevo.
          </p>
        )}
        {!loading && !error && receipt && <PaymentReceipt receipt={receipt} />}
      </DialogContent>
    </Dialog>
  )
}
