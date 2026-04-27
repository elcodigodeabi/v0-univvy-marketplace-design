'use server'

import { stripe, calculatePricing, formatEUR } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

/**
 * Test function: Validate Stripe integration
 * Checks:
 * - Stripe client is initialized
 * - Pricing calculations work correctly
 * - EUR formatting works
 * - Can retrieve account info from Stripe
 */
export async function validateStripeIntegration() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    passed: 0,
    failed: 0,
  }

  // Test 1: Stripe client initialized
  try {
    const account = await stripe.accounts.retrieve()
    results.tests.stripeClientInit = {
      status: 'PASS',
      message: 'Stripe client initialized',
      accountId: account.id,
    }
    results.passed++
  } catch (err: any) {
    results.tests.stripeClientInit = {
      status: 'FAIL',
      message: `Stripe client error: ${err.message}`,
    }
    results.failed++
  }

  // Test 2: Pricing calculation
  try {
    const pricing = calculatePricing(25, 60) // 25€/h for 1 hour
    const expectedTotal = Math.round(25 * 100 * 1.1) // 25€ + 10% = 27.50€
    if (pricing.totalCents === expectedTotal) {
      results.tests.pricingCalc = {
        status: 'PASS',
        message: 'Pricing calculation correct',
        example: {
          pricePerHour: 25,
          durationMinutes: 60,
          advisorAmount: formatEUR(pricing.advisorAmountCents),
          platformFee: formatEUR(pricing.platformFeeCents),
          total: formatEUR(pricing.totalCents),
        },
      }
      results.passed++
    } else {
      results.tests.pricingCalc = {
        status: 'FAIL',
        message: `Expected ${expectedTotal}, got ${pricing.totalCents}`,
      }
      results.failed++
    }
  } catch (err: any) {
    results.tests.pricingCalc = {
      status: 'FAIL',
      message: `Calculation error: ${err.message}`,
    }
    results.failed++
  }

  // Test 3: EUR formatting
  try {
    const formatted = formatEUR(2750)
    // El símbolo € tiene un espacio unicode no-breaking, así que comparamos normalizando
    const normalized = formatted.trim().replace(/\s+/g, ' ')
    if (normalized.includes('27') && normalized.includes('€')) {
      results.tests.eurFormatting = {
        status: 'PASS',
        message: 'EUR formatting correct',
        example: `2750 cents → "${formatted}"`,
      }
      results.passed++
    } else {
      results.tests.eurFormatting = {
        status: 'FAIL',
        message: `Expected EUR format with €, got "${formatted}"`,
      }
      results.failed++
    }
  } catch (err: any) {
    results.tests.eurFormatting = {
      status: 'FAIL',
      message: `Formatting error: ${err.message}`,
    }
    results.failed++
  }

  // Test 4: Supabase connection
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle errors in SSR context
            }
          },
        },
      }
    )
    const { data: testData, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (!error) {
      results.tests.supabaseConnection = {
        status: 'PASS',
        message: 'Supabase connection successful',
      }
      results.passed++
    } else {
      results.tests.supabaseConnection = {
        status: 'FAIL',
        message: `Supabase error: ${error.message}`,
      }
      results.failed++
    }
  } catch (err: any) {
    results.tests.supabaseConnection = {
      status: 'FAIL',
      message: `Connection error: ${err.message}`,
    }
    results.failed++
  }

  // Test 5: Webhook secret configured
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      results.tests.webhookSecret = {
        status: 'PASS',
        message: 'Webhook secret configured',
        secretPrefix: process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10) + '***',
      }
      results.passed++
    } else {
      results.tests.webhookSecret = {
        status: 'FAIL',
        message: 'STRIPE_WEBHOOK_SECRET not configured',
      }
      results.failed++
    }
  } catch (err: any) {
    results.tests.webhookSecret = {
      status: 'FAIL',
      message: err.message,
    }
    results.failed++
  }

  return results
}

export async function testCheckoutSessionCreation() {
  try {
    const pricing = calculatePricing(25, 60)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'TEST: Asesoría de Economía',
              description: 'Sesión de prueba para validar integración Stripe',
            },
            unit_amount: pricing.totalCents,
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/pago/exito?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/agendar',
      customer_email: 'test@example.com',
      metadata: {
        test: 'true',
        advisor_amount_cents: pricing.advisorAmountCents.toString(),
        platform_fee_cents: pricing.platformFeeCents.toString(),
      },
    })

    return {
      status: 'SUCCESS',
      message: 'Checkout session created successfully',
      sessionId: session.id,
      sessionUrl: session.url,
      amountInCents: pricing.totalCents,
      amountInEUR: formatEUR(pricing.totalCents),
    }
  } catch (err: any) {
    return {
      status: 'FAIL',
      message: `Checkout session creation error: ${err.message}`,
    }
  }
}
