import { NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/paypal"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const { bookingId, orderId } = await request.json()
    if (typeof bookingId !== "string" || typeof orderId !== "string") {
      return NextResponse.json({ error: "bookingId y orderId son requeridos" }, { status: 400 })
    }

    const { data: booking } = await supabase.from("bookings")
      .select("id, student_id, price, currency, status")
      .eq("id", bookingId).eq("student_id", user.id).single()
    if (!booking) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    if (!Number.isInteger(booking.price) || booking.price <= 0) {
      return NextResponse.json({ error: "Importe de reserva inválido" }, { status: 422 })
    }

    const order = await capturePayPalOrder(orderId)
    const captured = order.status === "COMPLETED"
    if (!captured) return NextResponse.json({ error: "PayPal no confirmó el pago", status: order.status }, { status: 402 })

    const capturedAmount = order.purchase_units?.[0]?.amount
    const expectedAmount = (booking.price / 100).toFixed(2)
    if (capturedAmount?.value !== expectedAmount || capturedAmount.currency_code !== (booking.currency || "EUR").toUpperCase()) {
      return NextResponse.json({ error: "El importe confirmado por PayPal no coincide con la reserva" }, { status: 409 })
    }

    const { error: paymentError } = await supabase.from("payments").update({ status: "in_escrow", currency: booking.currency || "EUR" }).eq("booking_id", booking.id)
    if (paymentError) throw paymentError
    const { error: bookingError } = await supabase.from("bookings").update({ status: "confirmed" }).eq("id", booking.id).eq("student_id", user.id)
    if (bookingError) throw bookingError

    return NextResponse.json({ success: true, status: order.status })
  } catch (error) {
    console.error("[v0] PayPal capture order error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 })
  }
}
