import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  try {
    if (code) {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log("[v0] Exchange code result:", { 
        hasUser: !!data?.user, 
        error: error?.message,
        code: code?.substring(0, 10) + "..."
      })

      if (error) {
        console.error("[v0] Exchange code error:", error.message)
        return NextResponse.redirect(`${origin}/auth/error?reason=invalid_code`)
      }

      if (!data.user) {
        console.warn("[v0] No user returned from exchange code")
        return NextResponse.redirect(`${origin}/auth/error?reason=no_user`)
      }

      // Successfully exchanged code for session
      // Redirect based on user type
      const userType = data.user.user_metadata?.tipo || "alumno"
      const redirectPath = userType === "asesor" ? "/dashboard-asesor" : "/dashboard"
      
      console.log("[v0] Exchange successful, redirecting to:", redirectPath)
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }

    // No code provided
    console.warn("[v0] No code provided in callback")
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
  } catch (error) {
    console.error("[v0] Callback error:", error)
    return NextResponse.redirect(`${origin}/auth/error?reason=server_error`)
  }
}
