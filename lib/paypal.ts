// Server-only PayPal Payouts client. Never import this from client components.
// Univvy sends payouts FROM its own PayPal Business balance TO the advisor's
// PayPal email. This does not move the student's Stripe payment directly —
// Univvy is responsible for keeping enough balance in its PayPal account.

const PAYPAL_MODE = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox"

const PAYPAL_BASE_URL =
  PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"

interface PayPalAccessToken {
  access_token: string
  expires_in: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token
  }

  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("PayPal no está configurado (faltan PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)")
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    const text = await response.text()
    console.error("[v0] PayPal OAuth error:", text)
    throw new Error("No se pudo autenticar con PayPal")
  }

  const data = (await response.json()) as PayPalAccessToken
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data.access_token
}

interface CreatePayoutParams {
  /** Unique key per payout attempt to make retries safe (PayPal sender_batch_id). */
  batchId: string
  recipientEmail: string
  amountInCents: number
  currency?: string
  note?: string
}

interface PayoutResult {
  payoutBatchId: string
  payoutItemId: string | null
  status: string
}

export async function createPayout({
  batchId,
  recipientEmail,
  amountInCents,
  currency = "USD",
  note = "Pago de ganancias Univvy",
}: CreatePayoutParams): Promise<PayoutResult> {
  const accessToken = await getAccessToken()

  const amountValue = (amountInCents / 100).toFixed(2)

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: "¡Has recibido un pago de Univvy!",
        email_message: note,
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amountValue,
            currency,
          },
          note,
          receiver: recipientEmail,
          sender_item_id: batchId,
        },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error("[v0] PayPal payout error:", data)
    const message =
      data?.message || data?.details?.[0]?.issue || "No se pudo crear el pago por PayPal"
    throw new Error(message)
  }

  return {
    payoutBatchId: data.batch_header?.payout_batch_id,
    payoutItemId: data.items?.[0]?.payout_item_id ?? null,
    status: data.batch_header?.batch_status ?? "UNKNOWN",
  }
}

export async function getPayoutItemStatus(payoutItemId: string) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/payments/payouts-item/${payoutItemId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    console.error("[v0] PayPal payout item status error:", text)
    throw new Error("No se pudo consultar el estado del pago en PayPal")
  }

  return response.json()
}

export function isValidPayPalEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
