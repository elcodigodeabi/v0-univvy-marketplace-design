import { NextResponse } from "next/server"
import { releaseEscrowFunds } from "@/lib/escrow"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

/**
 * POST /api/transfers/release
 * Body: { bookingId: string }
 *
 * Releases the escrowed funds to the advisor once the class is confirmed.
 * Can be called by the booking's student (authenticated session) or by a
 * cron job with the CRON_SECRET bearer token (auto-release). All the money
 * logic lives in `releaseEscrowFunds`.
 */
export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId requerido" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    const isCron = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`

    let callerUserId: string | null = null
    if (!isCron) {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
      }
      callerUserId = user.id
    }

    const admin = createServiceClient()
    const { data: booking } = await admin
      .from("bookings")
      .select("id, student_id")
      .eq("id", bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    if (!isCron && callerUserId !== booking.student_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const result = await releaseEscrowFunds(booking.id)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.retryable ? 502 : 409 })
    }

    if (result.alreadyReleased) {
      return NextResponse.json({
        message: "Los fondos ya fueron liberados",
        transferId: result.transferId,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Transfer release error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
