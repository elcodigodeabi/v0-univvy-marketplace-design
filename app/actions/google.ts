"use server"

import { createClient } from "@/lib/supabase/server"

/** Disconnect Google Calendar: remove the stored refresh token */
export async function disconnectGoogleCalendar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { error } = await supabase
    .from("profiles")
    .update({
      google_refresh_token: null,
      google_calendar_connected: false,
    })
    .eq("id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}
