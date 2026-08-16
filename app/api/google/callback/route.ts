import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exchangeCodeForTokens } from "@/lib/google-calendar"
import crypto from "crypto"

/**
 * GET /api/google/callback
 * Google redirects here after the advisor grants consent.
 * Validates state, exchanges the code, and stores the refresh token.
 */
export async function GET(request: NextRequest) {
  const configUrl = new URL("/configuracion-asesor", request.url)

  try {
    const code = request.nextUrl.searchParams.get("code")
    const state = request.nextUrl.searchParams.get("state")
    const oauthError = request.nextUrl.searchParams.get("error")

    if (oauthError || !code || !state) {
      configUrl.searchParams.set("google", "denied")
      return NextResponse.redirect(configUrl)
    }

    // Validate the signed state
    const [userId, signature] = state.split(".")
    const secret = process.env.SUPABASE_JWT_SECRET || "univvy-state-secret"
    const expected = crypto
      .createHmac("sha256", secret)
      .update(userId)
      .digest("hex")
      .slice(0, 32)

    if (signature !== expected) {
      configUrl.searchParams.set("google", "invalid_state")
      return NextResponse.redirect(configUrl)
    }

    // Must match the session user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      configUrl.searchParams.set("google", "session_mismatch")
      return NextResponse.redirect(configUrl)
    }

    // Exchange code for tokens
    const origin = request.nextUrl.origin
    const redirectUri = `${origin}/api/google/callback`
    const tokens = await exchangeCodeForTokens(code, redirectUri)

    if (!tokens.refresh_token) {
      // Can happen if the user previously granted access without prompt=consent
      configUrl.searchParams.set("google", "no_refresh_token")
      return NextResponse.redirect(configUrl)
    }

    // Store the refresh token in the advisor's profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_calendar_connected: true,
      })
      .eq("id", user.id)

    if (updateError) throw updateError

    configUrl.searchParams.set("google", "connected")
    return NextResponse.redirect(configUrl)
  } catch (error: any) {
    console.error("[v0] Google callback error:", error)
    configUrl.searchParams.set("google", "error")
    return NextResponse.redirect(configUrl)
  }
}
