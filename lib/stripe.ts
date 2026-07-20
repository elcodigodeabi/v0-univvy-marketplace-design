import Stripe from "stripe"

/**
 * Centralized Stripe server client.
 * STRIPE_SECRET_KEY must be set manually in the project's environment variables.
 * Never hardcode keys.
 */
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your environment variables."
    )
  }
  if (!_stripe) {
    _stripe = new Stripe(key, {
      apiVersion: "2024-06-20",
      typescript: true,
    })
  }
  return _stripe
}

/** Platform commission in basis points (e.g. 1500 = 15%) */
export const PLATFORM_FEE_BPS = 1500

/** Compute platform fee and advisor net amount from a total in cents */
export function splitAmount(totalCents: number) {
  const platformFee = Math.round((totalCents * PLATFORM_FEE_BPS) / 10000)
  const advisorAmount = totalCents - platformFee
  return { platformFee, advisorAmount }
}
