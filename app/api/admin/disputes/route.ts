import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const db = createServiceClient()

  const { data: disputes, error } = await db
    .from("disputes")
    .select(
      `id, booking_id, payment_id, raised_by, reason, evidence_urls, status, admin_notes, resolution, resolved_at, created_at,
       booking:bookings(id, subject, session_date, session_time, status, student_id, advisor_id),
       raiser:profiles!disputes_raised_by_fkey(id, full_name, email, role)`
    )
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with student/advisor names since bookings only stores IDs
  const participantIds = Array.from(
    new Set((disputes || []).flatMap((d: any) => [d.booking?.student_id, d.booking?.advisor_id]).filter(Boolean))
  )

  const { data: participants } = participantIds.length
    ? await db.from("profiles").select("id, full_name, email").in("id", participantIds)
    : { data: [] as { id: string; full_name: string; email: string }[] }

  const participantMap = new Map((participants || []).map((p) => [p.id, p]))

  const enriched = (disputes || []).map((d: any) => ({
    ...d,
    student: d.booking ? participantMap.get(d.booking.student_id) : null,
    advisor: d.booking ? participantMap.get(d.booking.advisor_id) : null,
  }))

  return NextResponse.json(enriched)
}
