import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test 1: Conexión a Stripe
    const account = await stripe.account.retrieve()
    
    // Test 2: Check API version
    const stripeVersion = "2024-12-18.acacia"
    
    // Test 3: Verificar que podemos leer el balance
    const balance = await stripe.balance.retrieve()
    
    return NextResponse.json({
      status: "connected",
      account: {
        id: account.id,
        email: account.email,
        country: account.country,
        type: account.type, // "express", "standard", "custom"
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      },
      api_version: stripeVersion,
      balance: {
        available: balance.available,
        pending: balance.pending,
      },
      can_use_connect: true, // Ya tienes acceso a Connect
      next_steps: [
        "1. Agregar tu cuenta bancaria personal en Stripe Dashboard",
        "2. Crear la tabla platform_config en Supabase",
        "3. Implementar Stripe Connect onboarding para asesores",
        "4. Configurar transfers automáticos advisor_amount → asesores",
      ],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        suggestion: "Verifica que STRIPE_SECRET_KEY esté configurada correctamente",
      },
      { status: 500 }
    )
  }
}
