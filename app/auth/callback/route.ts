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

      if (error) {
        // Password reset flow: redirect with error param so the page shows the right message
        if (next === "/recuperar-password") {
          return NextResponse.redirect(`${origin}/recuperar-password?error=invalid_link`)
        }
        return NextResponse.redirect(`${origin}/auth/error?reason=invalid_code`)
      }

      if (!data.user) {
        return NextResponse.redirect(`${origin}/auth/error?reason=no_user`)
      }

      // Password reset flow: session established server-side, go to update form
      if (next === "/recuperar-password") {
        return NextResponse.redirect(`${origin}/recuperar-password?mode=update`)
      }

      // Regular login/signup callback: redirect based on user type
      const userType = data.user.user_metadata?.tipo || "alumno"
      const redirectPath = userType === "asesor" ? "/dashboard-asesor" : "/dashboard"
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }

    // No code provided
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
  } catch (error) {
    return NextResponse.redirect(`${origin}/auth/error?reason=server_error`)
  }
}
