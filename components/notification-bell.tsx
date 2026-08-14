"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

interface NotificationRow {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return "ahora"
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHours = Math.round(diffMin / 60)
  if (diffHours < 24) return `hace ${diffHours} h`
  const diffDays = Math.round(diffHours / 24)
  return `hace ${diffDays} d`
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read_at).length

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, data, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    setNotifications(data || [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Live updates: new notifications appear without a page refresh.
  useEffect(() => {
    if (!user?.id) return
    const supabase = createClient()
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationRow, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
    const supabase = createClient()
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id)
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id)
    if (unreadIds.length === 0) return
    const now = new Date().toISOString()
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })))
    const supabase = createClient()
    await supabase.from("notifications").update({ read_at: now }).in("id", unreadIds)
  }

  const linkFor = (n: NotificationRow) => {
    const bookingId = (n.data as { booking_id?: string } | null)?.booking_id
    if (!bookingId) return null
    if (n.type === "payment_received" || n.type === "system") return `/pago/${bookingId}`
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <p className="font-semibold text-sm text-gray-900">Notificaciones</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={markAllAsRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-red-600" />
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              No tienes notificaciones todavía.
            </div>
          )}

          {!loading &&
            notifications.map((n) => {
              const href = linkFor(n)
              const content = (
                <div
                  className={`p-3 border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${
                    n.read_at ? "bg-white" : "bg-red-50/50 hover:bg-red-50"
                  }`}
                  onClick={() => !n.read_at && markAsRead(n.id)}
                >
                  <div className="flex items-start gap-2">
                    {!n.read_at && (
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-600 flex-shrink-0" />
                    )}
                    <div className={n.read_at ? "pl-3.5" : ""}>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.created_at)}</p>
                    </div>
                  </div>
                </div>
              )

              return href ? (
                <Link key={n.id} href={href} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              )
            })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
