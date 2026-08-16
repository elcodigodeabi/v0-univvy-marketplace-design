import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getGoogleAuthUrl } from "@/lib/google-calendar"
import crypto from "crypto"

/**
 * GET /api/google/connect
 * Starts the Google OAuth flow for an advisor.
 * Only authenticated advisors can connect their calendar.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Only advisors can connect Google Calendar
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "asesor") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Signed state: userId.signature — validated in the callback
    const secret = process.env.SUPABASE_JWT_SECRET || "univvy-state-secret"
    const signature = crypto
      .createHmac("sha256", secret)
      .update(user.id)
      .digest("hex")
      .slice(0, 32)
    const state = `${user.id}.${signature}`

    const origin = request.nextUrl.origin
    const redirectUri = `${origin}/api/google/callback`
    const authUrl = getGoogleAuthUrl(redirectUri, state)

    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error("[v0] Google connect error:", error)
    return NextResponse.redirect(
      new URL("/configuracion-asesor?google=error", request.url)
    )
  }
}
