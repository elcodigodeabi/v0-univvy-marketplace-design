import 'server-only'

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// ─── Univvy platform constants ─────────────────────────────────────────────
export const PLATFORM_FEE_PERCENT = 0.10   // 10% comisión Univvy
export const CURRENCY = 'eur'              // Moneda: euros
export const AUTO_RELEASE_HOURS = 24       // Escrow auto-release 24h tras la sesión

/**
 * Calculates price breakdown in euro cents.
 * pricePerHour is in euros (e.g. 25 → 25€/h)
 */
export function calculatePricing(pricePerHour: number, durationMinutes: number = 60) {
  const hourFraction = durationMinutes / 60
  const advisorAmountCents = Math.round(pricePerHour * hourFraction * 100)
  const platformFeeCents = Math.round(advisorAmountCents * PLATFORM_FEE_PERCENT)
  const totalCents = advisorAmountCents + platformFeeCents
  return { advisorAmountCents, platformFeeCents, totalCents }
}

/**
 * Format euro cents to display string: 2500 → "25,00 €"
 */
export function formatEUR(cents: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
