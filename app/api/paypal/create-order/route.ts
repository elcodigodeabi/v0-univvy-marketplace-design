import { NextResponse } from "next/server"
import { createPayPalOrder } from "@/lib/paypal"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const { bookingId } = await request.json()
    if (typeof bookingId !== "string") return NextResponse.json({ error: "bookingId requerido" }, { status: 400 })

    const { data: booking } = await supabase.from("bookings")
      .select("id, student_id, price, currency, status, subject, title")
      .eq("id", bookingId).eq("student_id", user.id).single()
    if (!booking) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    if (!["pending_request", "pending_payment"].includes(booking.status)) {
      return NextResponse.json({ error: "Esta reserva no admite pagos" }, { status: 409 })
    }
    if (!Number.isInteger(booking.price) || booking.price <= 0) {
      return NextResponse.json({ error: "Importe de reserva inválido" }, { status: 422 })
    }

    const order = await createPayPalOrder({
      bookingId: booking.id,
      amountInCents: booking.price,
      currency: booking.currency || "EUR",
      description: booking.subject || booking.title || "Reserva Univvy",
    })
    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error("[v0] PayPal create order error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 })
  }
}
