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
      typescript: true,
    })
  }
  return _stripe
}

/**
 * Platform commission in basis points (1300 = 13%).
 * Política de Univvy: 13% de comisión descontada al asesor tras cada clase exitosa.
 * ÚNICA fuente de verdad para la comisión — no duplicar este valor en otro archivo.
 */
export const PLATFORM_FEE_BPS = 1300

/** Compute platform fee and advisor net amount from a total in cents */
export function splitAmount(totalCents: number) {
  const platformFee = Math.round((totalCents * PLATFORM_FEE_BPS) / 10000)
  const advisorAmount = totalCents - platformFee
  return { platformFee, advisorAmount }
}
