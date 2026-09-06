import { NextResponse, type NextRequest } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/connect/oauth/callback
 * Stripe redirects here after the advisor authorizes (or denies) linking
 * their existing Stripe account. Exchanges the OAuth code for the connected
 * account id and stores it as a Standard connected account.
 */
export async function GET(request: NextRequest) {
  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000"}`

  const walletUrl = (params: string) => NextResponse.redirect(`${origin}/wallet?${params}`)

  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get("error")
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const expectedState = request.cookies.get("stripe_oauth_state")?.value

  if (error) {
    // e.g. "access_denied" when the advisor cancels the authorization
    return walletUrl("connect=denied")
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return walletUrl("connect=error")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return walletUrl("connect=error")
  }

  try {
    const stripe = getStripe()
    const tokenResponse = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    })

    const connectedAccountId = tokenResponse.stripe_user_id
    if (!connectedAccountId) {
      return walletUrl("connect=error")
    }

    const account = await stripe.accounts.retrieve(connectedAccountId)
    const onboardingComplete = account.details_submitted === true && account.payouts_enabled === true

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_account_id: connectedAccountId,
        stripe_account_type: "standard",
        stripe_onboarding_complete: onboardingComplete,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("[v0] Failed to save connected Stripe account:", updateError)
      return walletUrl("connect=error")
    }

    const response = walletUrl("connect=success")
    response.cookies.delete("stripe_oauth_state")
    return response
  } catch (err) {
    console.error("[v0] Stripe OAuth callback error:", err)
    return walletUrl("connect=error")
  }
}
