import { createClient } from "@/lib/supabase/server"
import { getAdminUser } from "@/lib/auth/require-admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()

    if (!userId || !role || !["alumno", "asesor", "administrador"].includes(role)) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
    }

    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const supabase = await createClient()

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
