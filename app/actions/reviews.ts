"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const REPORT_REASONS = ["estafa", "acoso", "falta_respeto", "incumplimiento", "otro"] as const

export async function submitReview(params: { bookingId: string; rating: number; comment?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  if (!Number.isInteger(params.rating) || params.rating < 1 || params.rating > 5) throw new Error("La calificación debe estar entre 1 y 5")

  const { data: booking, error: bookingError } = await supabase
    .from("bookings").select("id, student_id, advisor_id, status").eq("id", params.bookingId).eq("student_id", user.id).single()
  if (bookingError || !booking || booking.status !== "completed") throw new Error("Solo puedes calificar una sesión completada")

  const { error } = await supabase.from("reviews").upsert({
    booking_id: booking.id, reviewer_id: user.id, reviewed_id: booking.advisor_id,
    rating: params.rating, comment: params.comment?.trim().slice(0, 1000) || null,
  }, { onConflict: "booking_id,reviewer_id" })
  if (error) throw new Error(error.code === "23505" ? "Ya calificaste esta sesión" : "No se pudo guardar la calificación")
  revalidatePath("/mis-sesiones")
  revalidatePath(`/asesores/${booking.advisor_id}`)
  return { ok: true }
}

export async function submitAdvisorReport(params: { bookingId: string; reason: string; details: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  if (!REPORT_REASONS.includes(params.reason as typeof REPORT_REASONS[number])) throw new Error("Motivo de reporte no válido")
  if (params.details.trim().length < 10) throw new Error("Describe el caso con al menos 10 caracteres")

  const { data: booking, error: bookingError } = await supabase
    .from("bookings").select("id, student_id, advisor_id, status").eq("id", params.bookingId).eq("student_id", user.id).single()
  if (bookingError || !booking || !["completed", "disputed", "refunded"].includes(booking.status)) {
    throw new Error("Solo puedes reportar un asesor después de la sesión")
  }

  const { error } = await supabase.from("advisor_reports").insert({
    booking_id: booking.id, reporter_id: user.id, reported_id: booking.advisor_id,
    reason: params.reason, details: params.details.trim().slice(0, 3000),
  })
  if (error) throw new Error(error.code === "23505" ? "Ya reportaste esta sesión" : "No se pudo enviar el reporte")
  revalidatePath("/mis-sesiones")
  return { ok: true }
}

export async function getAdvisorReviews(advisorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("reviews")
    .select("id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name)")
    .eq("reviewed_id", advisorId).order("created_at", { ascending: false }).limit(20)
  if (error) throw new Error("No se pudieron cargar las reseñas")
  return data || []
}

export async function getMyReviewForBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from("reviews").select("id, rating, comment").eq("booking_id", bookingId).eq("reviewer_id", user.id).maybeSingle()
  return data
}

export async function hasReportForBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from("advisor_reports").select("id").eq("booking_id", bookingId).eq("reporter_id", user.id).maybeSingle()
  return Boolean(data)
}

export const REPORT_REASON_OPTIONS = [
  { value: "estafa", label: "Estafa o cobro irregular" },
  { value: "acoso", label: "Acoso o conducta inapropiada" },
  { value: "falta_respeto", label: "Falta de respeto" },
  { value: "incumplimiento", label: "No cumplió con la sesión" },
  { value: "otro", label: "Otro motivo" },
] as const

