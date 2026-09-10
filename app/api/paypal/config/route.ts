import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    clientId: process.env.PAYPAL_CLIENT_ID || null,
    mode: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
  })
}
