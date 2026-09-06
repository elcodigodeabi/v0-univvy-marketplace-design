import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/connect/onboard
 * Creates (or reuses) a Stripe Connect Express account for the logged-in advisor
 * and returns an onboarding Account Link URL.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Only advisors can onboard
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, email, stripe_account_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
    }
    if (profile.role !== "asesor") {
      return NextResponse.json(
        { error: "Solo los asesores pueden configurar pagos" },
        { status: 403 }
      )
    }

    const stripe = getStripe()
    let accountId = profile.stripe_account_id

    // Create Express account if the advisor doesn't have one yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "ES",
        email: profile.email ?? user.email ?? undefined,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { supabase_user_id: user.id },
      })
      accountId = account.id

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_account_id: accountId, stripe_account_type: "express" })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] Failed to save stripe_account_id:", updateError)
        return NextResponse.json(
          { error: "No se pudo guardar la cuenta de pagos" },
          { status: 500 }
        )
      }
    }

    const connectedAccount = await stripe.accounts.retrieve(accountId)

    if (connectedAccount.deleted) {
      return NextResponse.json(
        { error: "La cuenta bancaria de Stripe fue eliminada. Contacta con soporte para crearla de nuevo." },
        { status: 409 }
      )
    }

    if (connectedAccount.country !== "ES") {
      const spanishAccount = await stripe.accounts.create({
        type: "express",
        country: "ES",
        email: profile.email ?? user.email ?? undefined,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { supabase_user_id: user.id, migrated_from: accountId },
      })

      const { error: migrationError } = await supabase
        .from("profiles")
        .update({ stripe_account_id: spanishAccount.id, stripe_account_type: "express" })
        .eq("id", user.id)

      if (migrationError) {
        console.error("[v0] Failed to save Spanish Stripe account:", migrationError)
        return NextResponse.json(
          { error: "No se pudo guardar la nueva cuenta española de pagos" },
          { status: 500 }
        )
      }

      accountId = spanishAccount.id
    }

    // Build return URLs from the request origin
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000"}`

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/wallet?onboarding=refresh`,
      return_url: `${origin}/wallet?onboarding=complete`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url, accountId })
  } catch (error) {
    console.error("[v0] Connect onboard error:", error)
    const rawMessage = error instanceof Error ? error.message : "Error interno"
    const connectNotEnabled = rawMessage.includes("signed up for Connect") || rawMessage.includes("connect.me")

    if (connectNotEnabled) {
      return NextResponse.json(
        {
          error:
            "Stripe Connect todavía no está activado para esta cuenta. Actívalo en https://dashboard.stripe.com/connect.me y vuelve a intentarlo.",
          code: "CONNECT_NOT_ENABLED",
        },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: rawMessage }, { status: 500 })
  }
}
