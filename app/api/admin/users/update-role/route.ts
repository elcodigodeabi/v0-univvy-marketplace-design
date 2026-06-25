import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()

    if (!userId || !role || !["alumno", "asesor"].includes(role)) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Update user role in profiles
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, role })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
