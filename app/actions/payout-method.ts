"use server"

import { createClient } from "@/lib/supabase/server"
import { isValidPayPalEmail } from "@/lib/paypal"
import { revalidatePath } from "next/cache"

interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Sets PayPal as the advisor's active payout method and stores their PayPal
 * email. Switching methods is exclusive: activating PayPal does not delete
 * an existing Stripe account, it just stops using it for future releases.
 */
export async function setPayPalPayoutMethod(paypalEmail: string): Promise<ActionResult> {
  const trimmedEmail = paypalEmail.trim()

  if (!isValidPayPalEmail(trimmedEmail)) {
    return { success: false, error: "Ingresa un correo de PayPal válido" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ payout_method: "paypal", paypal_email: trimmedEmail })
    .eq("id", user.id)

  if (error) {
    console.error("[v0] Failed to set PayPal payout method:", error)
    return { success: false, error: "No se pudo guardar tu correo de PayPal" }
  }

  revalidatePath("/wallet")
  return { success: true }
}

/**
 * Switches the advisor's active payout method back to Stripe. Requires an
 * existing Stripe account (they must have completed onboarding previously).
 */
export async function setStripePayoutMethod(): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single()

  if (!profile?.stripe_account_id) {
    return { success: false, error: "Primero conecta o crea tu cuenta Stripe" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ payout_method: "stripe" })
    .eq("id", user.id)

  if (error) {
    console.error("[v0] Failed to set Stripe payout method:", error)
    return { success: false, error: "No se pudo actualizar tu método de cobro" }
  }

  revalidatePath("/wallet")
  return { success: true }
}
