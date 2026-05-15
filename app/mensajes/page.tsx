"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare, Clock, Lock, Loader2, BookOpen } from "lucide-react"
import { getUserChats } from "@/app/actions/chat"
import { useAuth } from "@/hooks/use-auth"

interface Chat {
  id: string
  booking_id: string
  is_active: boolean
  opens_at: string
  closes_at: string
  student: { id: string; full_name: string; avatar_url: string | null } | null
  advisor: { id: string; full_name: string; avatar_url: string | null } | null
  bookings: { id: string; subject: string; scheduled_at: string; duration_minutes: number } | null
}

function getStatus(chat: Chat): "upcoming" | "active" | "closed" {
  const now = Date.now()
  const opens = new Date(chat.opens_at).getTime()
  const closes = new Date(chat.closes_at).getTime()
  if (!chat.is_active || closes <= now) return "closed"
  if (opens > now) return "upcoming"
  return "active"
}

export default function MensajesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const result = await getUserChats()
      if (result.error) setError(result.error)
      else setChats(result.chats as Chat[])
      setLoading(false)
    }
    load()
  }, [])

  const activeChats = chats.filter((c) => getStatus(c) === "active")
  const upcomingChats = chats.filter((c) => getStatus(c) === "upcoming")
  const closedChats = chats.filter((c) => getStatus(c) === "closed")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-red-600">
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al Dashboard</span>
          </Link>
          <Link href="/dashboard">
            <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chats disponibles solo durante tus sesiones confirmadas
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <p className="text-gray-500 text-sm">Cargando chats...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        ) : chats.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No tienes chats activos</h3>
            <p className="text-sm text-gray-500 mb-6">
              Los chats se habilitan automáticamente cuando se confirma una sesión.
            </p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/buscar">Buscar asesores</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active chats */}
            {activeChats.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">En curso</h2>
                <div className="space-y-2">
                  {activeChats.map((chat) => (
                    <ChatCard key={chat.id} chat={chat} userId={user?.id} status="active" />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming chats */}
            {upcomingChats.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Próximamente</h2>
                <div className="space-y-2">
                  {upcomingChats.map((chat) => (
                    <ChatCard key={chat.id} chat={chat} userId={user?.id} status="upcoming" />
                  ))}
                </div>
              </section>
            )}

            {/* Closed chats */}
            {closedChats.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Finalizados</h2>
                <div className="space-y-2">
                  {closedChats.map((chat) => (
                    <ChatCard key={chat.id} chat={chat} userId={user?.id} status="closed" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function ChatCard({
  chat,
  userId,
  status,
}: {
  chat: Chat
  userId?: string
  status: "active" | "upcoming" | "closed"
}) {
  const router = useRouter()
  const otherUser = userId === chat.student?.id ? chat.advisor : chat.student
  const sessionDate = chat.bookings?.scheduled_at
    ? new Date(chat.bookings.scheduled_at).toLocaleString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

  return (
    <Card
      className={`p-4 transition-shadow ${
        status === "active"
          ? "cursor-pointer hover:shadow-md border-green-200 bg-green-50/30"
          : status === "upcoming"
          ? "border-amber-200 bg-amber-50/20"
          : "opacity-60"
      }`}
      onClick={() => status === "active" && router.push(`/mensajes/${chat.id}`)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 shrink-0">
          <AvatarImage src={otherUser?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-red-100 text-red-600 text-sm">
            {otherUser?.full_name?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-gray-900 truncate">{otherUser?.full_name}</p>
            {status === "active" && (
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs shrink-0">
                Activo
              </Badge>
            )}
            {status === "upcoming" && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs shrink-0 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Próximo
              </Badge>
            )}
            {status === "closed" && (
              <Badge variant="secondary" className="text-xs shrink-0 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Cerrado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <BookOpen className="h-3 w-3 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500 truncate">{chat.bookings?.subject}</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{sessionDate}</p>
        </div>

        {status === "active" && (
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white shrink-0 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/mensajes/${chat.id}`)
            }}
          >
            Abrir
          </Button>
        )}
      </div>
    </Card>
  )
}
