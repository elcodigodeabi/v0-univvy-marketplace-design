"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Star, DollarSign, ArrowLeft, MessageSquare, CheckCircle, Loader2 } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateChatByBooking } from "@/app/actions/chat"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Session {
  id: string
  student_id: string
  student_nombre: string
  materia: string
  fecha: string
  hora: string
  tipo: string
  duracion: string
  precio: number
  enlace?: string
  ubicacion?: string
  calificacion?: number
  comentario?: string
  estado: string
}

export default function MisSesionesAsesorPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("proximas")
  const [loading, setLoading] = useState(true)
  const [proximasSesiones, setProximasSesiones] = useState<Session[]>([])
  const [sesionesCompletadas, setSesionesCompletadas] = useState<Session[]>([])
  const [openingChat, setOpeningChat] = useState<string | null>(null)
  const [stats, setStats] = useState({
    ganancias: 0,
    totalSesiones: 0,
    rating: 0,
  })

  const handleOpenChat = async (bookingId: string) => {
    setOpeningChat(bookingId)
    const result = await getOrCreateChatByBooking(bookingId)
    if (result.error) {
      toast.error(result.error)
    } else if (result.chatId) {
      router.push(`/mensajes/${result.chatId}`)
    }
    setOpeningChat(null)
  }

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      try {
        // Fetch upcoming sessions
        const { data: upcoming } = await supabase
          .from("bookings")
          .select("*")
          .eq("asesor_id", user.id)
          .eq("status", "confirmed")
          .gte("scheduled_date", today)
          .order("scheduled_date", { ascending: true })

        if (upcoming) {
          setProximasSesiones(
            upcoming.map((s: any) => ({
              id: s.id,
              student_id: s.student_id,
              student_nombre: s.student_nombre || "Estudiante",
              materia: s.subject || "Asesoría",
              fecha: s.scheduled_date,
              hora: s.scheduled_time,
              tipo: s.modality || "Virtual",
              duracion: s.duration || "1 hr",
              precio: s.price || 0,
              enlace: s.meeting_link,
              ubicacion: s.location,
              estado: s.status,
            }))
          )
        }

        // Fetch completed sessions
        const { data: completed } = await supabase
          .from("bookings")
          .select("*")
          .eq("asesor_id", user.id)
          .eq("status", "completed")
          .order("scheduled_date", { ascending: false })
          .limit(10)

        if (completed) {
          setSesionesCompletadas(
            completed.map((s: any) => ({
              id: s.id,
              student_id: s.student_id,
              student_nombre: s.student_nombre || "Estudiante",
              materia: s.subject || "Asesoría",
              fecha: s.scheduled_date,
              hora: s.scheduled_time,
              tipo: s.modality || "Virtual",
              duracion: s.duration || "1 hr",
              precio: s.price || 0,
              calificacion: s.rating,
              comentario: s.review,
              estado: s.status,
            }))
          )
        }

        // Get profile stats
        const { data: profile } = await supabase
          .from("profiles")
          .select("rating, sesiones_completadas")
          .eq("id", user.id)
          .single()

        if (profile) {
          setStats({
            ganancias:
              (upcoming || []).reduce((sum: number, s: any) => sum + (s.price || 0), 0) +
              (completed || []).reduce((sum: number, s: any) => sum + (s.price || 0), 0),
            totalSesiones: (upcoming || []).length + (completed || []).length,
            rating: profile.rating || 0,
          })
        }
      } catch (err) {
        console.log("[v0] Error fetching sessions:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [user?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/dashboard-asesor">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                  <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
                </div>
              </div>
              <UserMenu variant="asesor" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
            <p className="text-gray-600">Cargando sesiones...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild size="sm">
                <Link href="/dashboard-asesor">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
              </div>
            </div>
            <UserMenu variant="asesor" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Sesiones</h1>
            <p className="text-gray-600">Administra tus asesorías y ganancias</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Ganancias Este Mes</p>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${stats.ganancias.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Sesiones Este Mes</p>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSesiones}</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Calificación Promedio</p>
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.rating > 0 ? stats.rating.toFixed(1) : "-"}
                  </p>
                  {stats.rating > 0 && (
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(stats.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="proximas" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximas
                {proximasSesiones.length > 0 && (
                  <Badge className="ml-1 bg-blue-600 text-white">{proximasSesiones.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completadas" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completadas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="proximas">
              <div className="space-y-4">
                {proximasSesiones.length > 0 ? (
                  proximasSesiones.map((sesion) => (
                    <Card key={sesion.id} className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14">
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {sesion.student_nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{sesion.student_nombre}</h3>
                              <p className="text-sm text-gray-600">{sesion.materia}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {sesion.fecha}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {sesion.hora}
                                </span>
                                <Badge variant="secondary">{sesion.tipo}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Pago</p>
                            <p className="text-2xl font-bold text-green-600">${sesion.precio.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{sesion.duracion}</p>
                          </div>
                        </div>

                        {sesion.tipo === "Virtual" && sesion.enlace && (
                          <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-blue-900 mb-2">Enlace de reunión:</p>
                            <a
                              href={sesion.enlace}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {sesion.enlace}
                            </a>
                          </div>
                        )}

                        {sesion.tipo === "Presencial" && sesion.ubicacion && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-gray-900 mb-1">Ubicación:</p>
                            <p className="text-sm text-gray-700">{sesion.ubicacion}</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                            <Link href={`/sesion/${sesion.id}`}>Ver Detalles</Link>
                          </Button>
                          {sesion.estado === "confirmed" && (
                            <Button
                              variant="outline"
                              className="border-gray-300 bg-transparent"
                              onClick={() => handleOpenChat(sesion.id)}
                              disabled={openingChat === sesion.id}
                            >
                              {openingChat === sesion.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <MessageSquare className="h-4 w-4 mr-2" />
                              )}
                              Chat
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No tienes sesiones próximas</p>
                    <p className="text-sm">Las sesiones confirmadas aparecerán aquí</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completadas">
              <div className="space-y-4">
                {sesionesCompletadas.length > 0 ? (
                  sesionesCompletadas.map((sesion) => (
                    <Card key={sesion.id} className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {sesion.student_nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">{sesion.student_nombre}</h4>
                              <p className="text-sm text-gray-600">{sesion.materia}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {sesion.fecha} • {sesion.duracion}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">${sesion.precio.toLocaleString()}</p>
                            <Badge className="mt-1 bg-green-100 text-green-700 border-green-300">Completada</Badge>
                          </div>
                        </div>

                        {sesion.calificacion && (
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm font-medium text-gray-900">Calificación:</p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < sesion.calificacion! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {sesion.comentario && <p className="text-sm text-gray-700 italic">"{sesion.comentario}"</p>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No tienes sesiones completadas</p>
                    <p className="text-sm">Las sesiones que completes aparecerán aquí</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
