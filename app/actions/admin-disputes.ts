"use server"

import { revalidatePath } from "next/cache"
import { getAdminUser } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/service"
import { createNotification } from "@/lib/notifications"

export type DisputeResolutionStatus = "under_review" | "resolved_student" | "resolved_advisor" | "closed"

/**
 * Updates a dispute's status and admin notes. Does not touch payments or
 * trigger Stripe/PayPal transfers — resolving the financial side of a
 * dispute is a separate, explicit action outside this admin inbox.
 */
export async function updateDisputeStatus(params: {
  disputeId: string
  status: DisputeResolutionStatus
  adminNotes?: string
}) {
  const admin = await getAdminUser()
  if (!admin) {
    return { error: "No autorizado" as const }
  }

  const db = createServiceClient()

  const { data: dispute, error: fetchError } = await db
    .from("disputes")
    .select("id, booking_id, raised_by, status")
    .eq("id", params.disputeId)
    .single()

  if (fetchError || !dispute) {
    return { error: "Disputa no encontrada" as const }
  }

  const isResolved = params.status === "resolved_student" || params.status === "resolved_advisor" || params.status === "closed"

  const { error: updateError } = await db
    .from("disputes")
    .update({
      status: params.status,
      admin_notes: params.adminNotes ?? null,
      resolved_by: isResolved ? admin.id : null,
      resolved_at: isResolved ? new Date().toISOString() : null,
    })
    .eq("id", params.disputeId)

  if (updateError) {
    return { error: updateError.message }
  }

  if (isResolved) {
    const { data: booking } = await db
      .from("bookings")
      .select("student_id, advisor_id")
      .eq("id", dispute.booking_id)
      .single()

    if (booking) {
      const notifyIds = [booking.student_id, booking.advisor_id]
      await Promise.all(
        notifyIds.map((userId) =>
          createNotification({
            userId,
            type: "dispute_resolved",
            title: "Reporte actualizado",
            body: "Un administrador revisó y resolvió el reporte relacionado con tu reserva.",
            data: { disputeId: dispute.id, bookingId: dispute.booking_id },
          })
        )
      )
    }
  }

  revalidatePath("/admin/reportes")
  return { success: true as const }
}
