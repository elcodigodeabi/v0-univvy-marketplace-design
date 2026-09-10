import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    clientId: process.env.PAYPAL_CLIENT_ID?.trim() || null,
    mode: (process.env.PAYPAL_MODE || "sandbox").trim().toLowerCase() === "live" ? "live" : "sandbox",
  })
}
