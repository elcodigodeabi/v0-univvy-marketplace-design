"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Video, CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { disconnectGoogleCalendar } from "@/app/actions/google"
import { toast } from "sonner"

/**
 * Card shown in the advisor settings to connect/disconnect Google Calendar.
 * When connected, accepting a booking automatically creates a calendar event
 * with a Google Meet link and invites the student.
 */
export function GoogleCalendarCard() {
  const { user } = useAuth()
  const [connected, setConnected] = useState<boolean | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      if (!user?.id) return
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("google_calendar_connected")
        .eq("id", user.id)
        .single()
      setConnected(data?.google_calendar_connected ?? false)
    }
    checkStatus()

    // Show feedback when returning from the OAuth flow
    const params = new URLSearchParams(window.location.search)
    const googleStatus = params.get("google")
    if (googleStatus === "connected") {
      toast.success("Google Calendar conectado correctamente")
      setConnected(true)
    } else if (googleStatus && googleStatus !== "connected") {
      toast.error("No se pudo conectar Google Calendar. Intenta de nuevo.")
    }
    if (googleStatus) {
      // Clean the query param without reloading
      const url = new URL(window.location.href)
      url.searchParams.delete("google")
      window.history.replaceState({}, "", url.toString())
    }
  }, [user?.id])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    const result = await disconnectGoogleCalendar()
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Google Calendar desconectado")
      setConnected(false)
    }
    setDisconnecting(false)
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <Calendar className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              Google Calendar
              {connected && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Videollamadas de Google Meet automáticas para tus sesiones
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Video className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
          <p>
            Al aceptar una solicitud, se crea automáticamente un evento en tu
            calendario con link de Google Meet y se invita al alumno por email.
          </p>
        </div>

        {connected === null ? (
          <Button disabled variant="outline" className="bg-transparent">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Verificando...
          </Button>
        ) : connected ? (
          <Button
            variant="outline"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="border-gray-300 bg-transparent text-gray-700"
          >
            {disconnecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Desconectar Google Calendar
          </Button>
        ) : (
          <Button
            asChild
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <a href="/api/google/connect">
              <Calendar className="h-4 w-4 mr-2" />
              Conectar Google Calendar
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
