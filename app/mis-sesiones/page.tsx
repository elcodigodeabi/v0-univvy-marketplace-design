"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Star,
  Loader2,
  Shield,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getMyBookings, studentConfirmSession } from "@/app/actions/bookings"
import { toast } from "sonner"

type Booking = Awaited<ReturnType<typeof getMyBookings>>[number]

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending_payment: {
      label: "Pago pendiente",
      className: "bg-yellow-100 text-yellow-700 border-0",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
    confirmed: {
      label: "Confirmada",
      className: "bg-green-100 text-green-700 border-0",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
    },
    pending_confirm: {
      label: "Esperando confirmacion",
      className: "bg-blue-100 text-blue-700 border-0",
      icon: <Shield className="h-3 w-3 mr-1" />,
    },
    completed: {
      label: "Completada",
      className: "bg-gray-100 text-gray-700 border-0",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
    },
    disputed: {
      label: "En disputa",
      className: "bg-orange-100 text-orange-700 border-0",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
    cancelled: {
      label: "Cancelada",
      className: "bg-red-100 text-red-700 border-0",
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
    refunded: {
      label: "Reembolsada",
      className: "bg-gray-100 text-gray-700 border-0",
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  }
  const cfg = map[status] || { label: status, className: "bg-gray-100 text-gray-600 border-0", icon: null }
  return (
    <Badge className={cfg.className}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  )
}

function isSessionPast(scheduledAt: string) {
  return new Date(scheduledAt) < new Date()
}

export default function MisSesionesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("proximas")
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [confirming, startConfirming] = useTransition()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    getMyBookings().then((data) => {
      setBookings(data)
      setLoading(false)
    })
  }, [user?.id])

  const handleConfirm = (bookingId: string, occurred: boolean) => {
    setConfirmingId(bookingId)
    startConfirming(async () => {
      try {
        await studentConfirmSession(bookingId, occurred)
        const updated = await getMyBookings()
        setBookings(updated)
        toast.success(occurred ? "Confirmaste que la sesion ocurrio. El pago se liberara al asesor." : "Notificamos a Univvy para resolver la situacion.")
      } catch {
        toast.error("Error al confirmar. Intenta de nuevo.")
      } finally {
        setConfirmingId(null)
      }
    })
  }

  const upcoming = bookings.filter((b) => ["pending_payment", "confirmed"].includes(b.status) && !isSessionPast(b.scheduled_at))
  const pendingConfirm = bookings.filter((b) => b.status === "pending_confirm" || (["confirmed"].includes(b.status) && isSessionPast(b.scheduled_at) && b.student_confirmed === null))
  const completed = bookings.filter((b) => ["completed", "refunded"].includes(b.status))
  const cancelled = bookings.filter((b) => ["cancelled", "disputed"].includes(b.status))

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  const formatPrice = (centimos: number) => `S/ ${(centimos / 100).toFixed(2)}`

  const renderCard = (b: Booking) => {
    const advisorProfile = b.advisor as any
    const advisorName = advisorProfile?.full_name || b.advisor_name || "Asesor"
    const avatarUrl = advisorProfile?.avatar_url
    const initials = advisorName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
    const needsConfirm =
      isSessionPast(b.scheduled_at) &&
      (b.status === "confirmed" || b.status === "pending_confirm") &&
      b.student_confirmed === null

    return (
      <Card key={b.id} className="border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                <AvatarFallback className="bg-red-100 text-red-600">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{advisorName}</h3>
                <p className="text-sm text-gray-600 mb-2">{b.subject || b.title}</p>
                {getStatusBadge(b.status)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{formatPrice(b.price)}</p>
              <p className="text-xs text-gray-500">{b.duration_minutes} min</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-red-600 flex-shrink-0" />
              {formatDate(b.scheduled_at)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
              {formatTime(b.scheduled_at)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {b.modalidad === "virtual"
                ? <><Video className="h-4 w-4 text-red-600" />Virtual</>
                : <><MapPin className="h-4 w-4 text-red-600" />{b.location || "Presencial"}</>}
            </div>
          </div>

          {/* Escrow info for confirmed upcoming */}
          {b.status === "confirmed" && !isSessionPast(b.scheduled_at) && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mb-4 text-sm text-blue-800">
              <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Pago en garantia · Se liberara al asesor tras confirmar la sesion</span>
            </div>
          )}

          {/* Post-session confirmation banner */}
          {needsConfirm && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="font-semibold text-amber-900 mb-1">La sesion ya paso — confirma como resulto</p>
              <p className="text-sm text-amber-800 mb-3">
                ¿La asesoría con {advisorName} se realizó correctamente? Tu respuesta determina si el pago se libera.
              </p>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={confirming && confirmingId === b.id}
                  onClick={() => handleConfirm(b.id, true)}
                >
                  {confirming && confirmingId === b.id
                    ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    : <ThumbsUp className="h-4 w-4 mr-2" />}
                  Si, se realizo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                  disabled={confirming && confirmingId === b.id}
                  onClick={() => handleConfirm(b.id, false)}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  No ocurrio
                </Button>
              </div>
            </div>
          )}

          {/* Already confirmed */}
          {b.student_confirmed === true && b.status !== "completed" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-4 text-sm text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Confirmaste que la sesion ocurrio. Esperando confirmacion del asesor.
            </div>
          )}
          {b.student_confirmed === false && b.status === "disputed" && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg mb-4 text-sm text-orange-800">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Disputa abierta. El equipo de Univvy revisara el caso.
            </div>
          )}

          <div className="flex gap-2">
            {b.status === "confirmed" && !isSessionPast(b.scheduled_at) && b.modalidad === "virtual" && b.meeting_link && (
              <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <a href={b.meeting_link} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-2" />
                  Unirse a la sesion
                </a>
              </Button>
            )}
            {b.status === "completed" && (
              <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white">
                <Star className="h-4 w-4 mr-2" />
                Calificar asesor
              </Button>
            )}
            <Button variant="outline" asChild className="border-gray-300 bg-transparent">
              <Link href={`/mensajes?user=${b.advisor_id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensaje
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" asChild className="text-gray-700">
              <Link href="/dashboard"><ArrowLeft className="h-5 w-5 mr-2" />Volver al Dashboard</Link>
            </Button>
            <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
          <p className="text-gray-600">Cargando sesiones...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild className="text-gray-700">
            <Link href="/dashboard"><ArrowLeft className="h-5 w-5 mr-2" />Volver al Dashboard</Link>
          </Button>
          <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Sesiones</h1>
            <p className="text-gray-600">Gestiona todas tus asesorias academicas</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Proximas sesiones</p>
                  <p className="text-3xl font-bold text-red-600">{upcoming.length}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Por confirmar</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingConfirm.length}</p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completadas</p>
                  <p className="text-3xl font-bold text-green-600">{completed.length}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="proximas">Proximas ({upcoming.length})</TabsTrigger>
                  <TabsTrigger value="confirmar">
                    Confirmar
                    {pendingConfirm.length > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white text-xs">
                        {pendingConfirm.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="completadas">Completadas ({completed.length})</TabsTrigger>
                  <TabsTrigger value="canceladas">Canceladas ({cancelled.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="proximas">
                  <div className="space-y-4">
                    {upcoming.length > 0 ? upcoming.map(renderCard) : (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No tienes sesiones proximas</p>
                        <Button asChild className="bg-red-600 hover:bg-red-700 text-white mt-4">
                          <Link href="/buscar">Buscar asesores</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="confirmar">
                  <div className="space-y-4">
                    {pendingConfirm.length > 0 ? pendingConfirm.map(renderCard) : (
                      <div className="text-center py-12 text-gray-500">
                        <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay sesiones pendientes de confirmacion</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="completadas">
                  <div className="space-y-4">
                    {completed.length > 0 ? completed.map(renderCard) : (
                      <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No tienes sesiones completadas</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="canceladas">
                  <div className="space-y-4">
                    {cancelled.length > 0 ? cancelled.map(renderCard) : (
                      <div className="text-center py-12 text-gray-500">
                        <XCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No tienes sesiones canceladas</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
