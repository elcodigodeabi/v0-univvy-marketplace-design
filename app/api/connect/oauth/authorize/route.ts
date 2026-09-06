import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/connect/oauth/authorize
 * Starts the Stripe Connect OAuth flow so an advisor who already has a
 * Stripe account can link it (Standard account) instead of getting a new
 * Express account created for them.
 */
export async function POST(request: Request) {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "Stripe Connect OAuth no está configurado. Agrega el Client ID de Connect (Dashboard → Settings → Connect → OAuth settings) como STRIPE_CONNECT_CLIENT_ID.",
        code: "OAUTH_NOT_CONFIGURED",
      },
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
    .select("id, role")
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

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000"}`

  const state = randomUUID()

  const authorizeUrl = new URL("https://connect.stripe.com/oauth/authorize")
  authorizeUrl.searchParams.set("response_type", "code")
  authorizeUrl.searchParams.set("client_id", clientId)
  authorizeUrl.searchParams.set("scope", "read_write")
  authorizeUrl.searchParams.set("redirect_uri", `${origin}/api/connect/oauth/callback`)
  authorizeUrl.searchParams.set("state", state)
  authorizeUrl.searchParams.set("stripe_user[email]", user.email ?? "")

  const response = NextResponse.json({ url: authorizeUrl.toString() })
  response.cookies.set("stripe_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  return response
}
