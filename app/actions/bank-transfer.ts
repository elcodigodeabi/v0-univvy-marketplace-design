"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { calculatePricing } from "@/lib/stripe"
import { revalidatePath } from "next/cache"

// ─── Datos bancarios de la cuenta receptora (desde variables de entorno) ──
export function getBankAccountDetails() {
  return {
    holder: process.env.BANK_ACCOUNT_HOLDER || "Univvy SL",
    iban: process.env.BANK_IBAN || "ES91 2100 0418 4502 0005 1332",
    swift: process.env.BANK_SWIFT || "CAIXESBBXXX",
    bankName: process.env.BANK_NAME || "CaixaBank",
  }
}

// ─── Iniciar una transferencia bancaria para una reserva ──────────────────
// Crea la reserva en estado pending_payment y el registro bank_transfer en pending.
export async function initBankTransfer(params: {
  advisorId: string
  advisorName: string
  scheduledAt: string
  durationMinutes: number
  modalidad: "virtual" | "presencial"
  notes?: string
  subject?: string
  pricePerHour: number
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("No autenticado")

  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  const { advisorAmountCents, platformFeeCents, totalCents } = calculatePricing(
    params.pricePerHour,
    params.durationMinutes
  )

  const scheduledDate = new Date(params.scheduledAt)
  const title = params.subject ? `Asesoría: ${params.subject}` : "Asesoría"

  // 1. Crear reserva con estado pending_payment
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      student_id: user.id,
      advisor_id: params.advisorId,
      title,
      subject: params.subject,
      notes: params.notes,
      scheduled_at: params.scheduledAt,
      duration_minutes: params.durationMinutes,
      modalidad: params.modalidad,
      price: totalCents,
      platform_fee: platformFeeCents,
      advisor_amount: advisorAmountCents,
      currency: "EUR",
      status: "pending_payment",
      advisor_name: params.advisorName,
      student_name: studentProfile?.full_name || user.email?.split("@")[0] || "Estudiante",
    })
    .select()
    .single()

  if (bookingError || !booking) {
    throw new Error("Error al crear la reserva: " + (bookingError?.message || ""))
  }

  const bankDetails = getBankAccountDetails()

  // 2. Crear registro de transferencia bancaria
  const { data: transfer, error: transferError } = await supabase
    .from("bank_transfers")
    .insert({
      booking_id: booking.id,
      payer_id: user.id,
      amount_cents: totalCents,
      platform_fee_cents: platformFeeCents,
      advisor_amount_cents: advisorAmountCents,
      currency: "EUR",
      status: "pending",
      transfer_reference: `UNIVVY-${booking.id.slice(0, 8).toUpperCase()}`,
      bank_name: bankDetails.bankName,
      bank_iban: bankDetails.iban,
      bank_account_holder: bankDetails.holder,
      bank_swift: bankDetails.swift,
    })
    .select()
    .single()

  if (transferError || !transfer) {
    // Revertir la reserva
    await supabase.from("bookings").delete().eq("id", booking.id)
    throw new Error("Error al crear el registro de transferencia")
  }

  return {
    bookingId: booking.id,
    transferId: transfer.id,
    reference: transfer.transfer_reference,
    totalCents,
    bankDetails,
  }
}

// ─── Subir comprobante de transferencia ──────────────────────────────────
export async function uploadTransferProof(params: {
  transferId: string
  bookingId: string
  proofUrl: string
  transferDate: string       // YYYY-MM-DD
  transferTime?: string      // HH:MM
  reference?: string
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("No autenticado")

  const { error } = await supabase
    .from("bank_transfers")
    .update({
      status: "proof_uploaded",
      proof_url: params.proofUrl,
      proof_uploaded_at: new Date().toISOString(),
      transfer_date: params.transferDate,
      transfer_time: params.transferTime || null,
      transfer_reference: params.reference || undefined,
    })
    .eq("id", params.transferId)
    .eq("payer_id", user.id)

  if (error) throw new Error("Error al subir el comprobante: " + error.message)

  revalidatePath("/mis-sesiones")
  return { success: true }
}

// ─── Admin: validar una transferencia bancaria ────────────────────────────
// Solo puede ser llamado por el administrador (usar service client).
export async function validateBankTransfer(transferId: string) {
  const supabase = createServiceClient()
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error("No autenticado")

  // Verificar que es admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "administrador") throw new Error("Sin permisos de administrador")

  // Obtener la transferencia con datos del booking
  const { data: transfer } = await supabase
    .from("bank_transfers")
    .select("*, booking:bookings(*)")
    .eq("id", transferId)
    .single()

  if (!transfer) throw new Error("Transferencia no encontrada")

  // Actualizar transferencia a validada
  await supabase
    .from("bank_transfers")
    .update({
      status: "validated",
      validated_by: user.id,
      validated_at: new Date().toISOString(),
    })
    .eq("id", transferId)

  // Confirmar la reserva
  await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", transfer.booking_id)
    .eq("status", "pending_payment")

  // Crear registro en payments
  await supabase.from("payments").upsert(
    {
      booking_id: transfer.booking_id,
      payer_id: transfer.payer_id,
      payee_id: (transfer.booking as any)?.advisor_id,
      amount: transfer.amount_cents,
      platform_fee: transfer.platform_fee_cents,
      advisor_amount: transfer.advisor_amount_cents,
      currency: "EUR",
      status: "in_escrow",
    },
    { onConflict: "booking_id" }
  )

  revalidatePath("/mis-sesiones")
  revalidatePath("/mis-sesiones-asesor")
  return { success: true }
}

// ─── Admin: rechazar una transferencia bancaria ───────────────────────────
export async function rejectBankTransfer(transferId: string, reason: string) {
  const supabase = createServiceClient()
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "administrador") throw new Error("Sin permisos de administrador")

  await supabase
    .from("bank_transfers")
    .update({
      status: "rejected",
      rejection_reason: reason,
      validated_by: user.id,
      validated_at: new Date().toISOString(),
    })
    .eq("id", transferId)

  revalidatePath("/mis-sesiones")
  return { success: true }
}

// ─── Obtener estado de una transferencia bancaria ─────────────────────────
export async function getBankTransferStatus(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("bank_transfers")
    .select("*")
    .eq("booking_id", bookingId)
    .eq("payer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return data
}
