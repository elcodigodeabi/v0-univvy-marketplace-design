import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/connect/oauth/disconnect
 * Revokes the OAuth grant for an advisor's linked Standard account so they
 * can connect a different Stripe account. Only applies to Standard
 * (OAuth-linked) accounts — Express accounts created by Univvy are not
 * deauthorized this way.
 */
export async function POST() {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      { error: "Stripe Connect OAuth no está configurado." },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, stripe_account_id, stripe_account_type")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
  }

  if (!profile.stripe_account_id || profile.stripe_account_type !== "standard") {
    return NextResponse.json(
      { error: "No hay una cuenta Stripe conectada para desvincular" },
      { status: 400 }
    )
  }

  try {
    const stripe = getStripe()
    await stripe.oauth.deauthorize({
      client_id: clientId,
      stripe_user_id: profile.stripe_account_id,
    })

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_account_id: null,
        stripe_account_type: null,
        stripe_onboarding_complete: false,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("[v0] Failed to clear disconnected Stripe account:", updateError)
      return NextResponse.json({ error: "No se pudo actualizar el perfil" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Stripe OAuth disconnect error:", err)
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
