import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/connect/login-link
 * Returns a one-time link to the advisor's Stripe Express dashboard.
 * Only valid for Express accounts — Standard accounts sign in directly at
 * dashboard.stripe.com with their own Stripe credentials.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_account_type")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.stripe_account_id) {
    return NextResponse.json({ error: "No hay cuenta Stripe configurada" }, { status: 404 })
  }

  if (profile.stripe_account_type !== "express") {
    return NextResponse.json(
      { error: "Este enlace solo aplica a cuentas Express" },
      { status: 400 }
    )
  }

  try {
    const stripe = getStripe()
    const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id)
    return NextResponse.json({ url: loginLink.url })
  } catch (err) {
    console.error("[v0] Stripe Express login link error:", err)
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
