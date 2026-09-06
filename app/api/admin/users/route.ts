import { createClient } from "@/lib/supabase/server"
import { getAdminUser } from "@/lib/auth/require-admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const supabase = await createClient()

    // Fetch all users from profiles
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
