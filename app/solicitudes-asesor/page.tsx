"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, MessageSquare, MapPin, Loader2 } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

interface Request {
  id: string
  student_id: string
  student_nombre: string
  universidad: string
  carrera: string
  materia: string
  fecha: string
  hora: string
  tipo: string
  duracion: string
  precio: number
  mensaje: string
  estado: string
  motivo_rechazo?: string
}

export default function SolicitudesAsesorPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("pendientes")
  const [loading, setLoading] = useState(true)
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<Request[]>([])
  const [solicitudesAceptadas, setSolicitudesAceptadas] = useState<Request[]>([])
  const [solicitudesRechazadas, setSolicitudesRechazadas] = useState<Request[]>([])

  useEffect(() => {
    async function fetchRequests() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      const supabase = createClient()

      try {
        // Fetch pending requests
        const { data: pending } = await supabase
          .from("bookings")
          .select("*")
          .eq("asesor_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (pending) {
          setSolicitudesPendientes(
            pending.map((s: any) => ({
              id: s.id,
              student_id: s.student_id,
              student_nombre: s.student_nombre || "Estudiante",
              universidad: s.student_university || "Universidad",
              carrera: s.student_career || "Carrera",
              materia: s.subject || "Asesoría",
              fecha: s.scheduled_date,
              hora: s.scheduled_time,
              tipo: s.modality || "Virtual",
              duracion: s.duration || "1 hora",
              precio: s.price || 0,
              mensaje: s.student_message || "",
              estado: s.status,
            }))
          )
        }

        // Fetch accepted requests
        const { data: accepted } = await supabase
          .from("bookings")
          .select("*")
          .eq("asesor_id", user.id)
          .eq("status", "confirmed")
          .order("scheduled_date", { ascending: true })
          .limit(10)

        if (accepted) {
          setSolicitudesAceptadas(
            accepted.map((s: any) => ({
              id: s.id,
              student_id: s.student_id,
              student_nombre: s.student_nombre || "Estudiante",
              universidad: s.student_university || "Universidad",
              carrera: s.student_career || "Carrera",
              materia: s.subject || "Asesoría",
              fecha: s.scheduled_date,
              hora: s.scheduled_time,
              tipo: s.modality || "Virtual",
              duracion: s.duration || "1 hora",
              precio: s.price || 0,
              mensaje: s.student_message || "",
              estado: s.status,
            }))
          )
        }

        // Fetch rejected requests
        const { data: rejected } = await supabase
          .from("bookings")
          .select("*")
          .eq("asesor_id", user.id)
          .eq("status", "rejected")
          .order("updated_at", { ascending: false })
          .limit(10)

        if (rejected) {
          setSolicitudesRechazadas(
            rejected.map((s: any) => ({
              id: s.id,
              student_id: s.student_id,
              student_nombre: s.student_nombre || "Estudiante",
              universidad: s.student_university || "Universidad",
              carrera: s.student_career || "Carrera",
              materia: s.subject || "Asesoría",
              fecha: s.scheduled_date,
              hora: s.scheduled_time,
              tipo: s.modality || "Virtual",
              duracion: s.duration || "1 hora",
              precio: s.price || 0,
              mensaje: s.student_message || "",
              estado: s.status,
              motivo_rechazo: s.rejection_reason,
            }))
          )
        }
      } catch (err) {
        console.log("[v0] Error fetching requests:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
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
            <p className="text-gray-600">Cargando solicitudes...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitudes de Asesoría</h1>
            <p className="text-gray-600">Administra las solicitudes de tus estudiantes</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pendientes" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pendientes
                {solicitudesPendientes.length > 0 && (
                  <Badge className="ml-1 bg-red-600 text-white">{solicitudesPendientes.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="aceptadas" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Aceptadas
              </TabsTrigger>
              <TabsTrigger value="rechazadas" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rechazadas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendientes">
              <div className="space-y-4">
                {solicitudesPendientes.length > 0 ? (
                  solicitudesPendientes.map((solicitud) => (
                    <Card key={solicitud.id} className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14">
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {solicitud.student_nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{solicitud.student_nombre}</h3>
                              <p className="text-sm text-gray-600">{solicitud.universidad}</p>
                              <p className="text-xs text-gray-500">{solicitud.carrera}</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pendiente</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-gray-900">Materia:</span>
                              <span className="text-gray-600">{solicitud.materia}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{solicitud.fecha}</span>
                              <Clock className="h-4 w-4 text-gray-400 ml-2" />
                              <span className="text-gray-600">{solicitud.hora}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <Badge variant="secondary">{solicitud.tipo}</Badge>
                              <span className="text-gray-600">• {solicitud.duracion}</span>
                            </div>
                          </div>
                          <div className="flex flex-col justify-between">
                            <div className="text-right">
                              <p className="text-sm text-gray-600 mb-1">Pago estimado</p>
                              <p className="text-2xl font-bold text-green-600">${solicitud.precio.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {solicitud.mensaje && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-gray-900 mb-1">Mensaje del estudiante:</p>
                            <p className="text-sm text-gray-700">{solicitud.mensaje}</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aceptar Solicitud
                          </Button>
                          <Button variant="outline" className="flex-1 border-gray-300 bg-transparent">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contactar
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No tienes solicitudes pendientes</p>
                    <p className="text-sm">Las nuevas solicitudes aparecerán aquí</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="aceptadas">
              <div className="space-y-4">
                {solicitudesAceptadas.length > 0 ? (
                  solicitudesAceptadas.map((solicitud) => (
                    <Card key={solicitud.id} className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {solicitud.student_nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">{solicitud.student_nombre}</h4>
                              <p className="text-sm text-gray-600">{solicitud.materia}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {solicitud.fecha} • {solicitud.hora}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {solicitud.tipo}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-green-100 text-green-700 border-green-300">Confirmada</Badge>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">${solicitud.precio.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No tienes solicitudes aceptadas</p>
                    <p className="text-sm">Las solicitudes que aceptes aparecerán aquí</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rechazadas">
              <div className="space-y-4">
                {solicitudesRechazadas.length > 0 ? (
                  solicitudesRechazadas.map((solicitud) => (
                    <Card key={solicitud.id} className="border-gray-200 bg-gray-50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 grayscale">
                              <AvatarFallback className="bg-gray-200 text-gray-600">
                                {solicitud.student_nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">{solicitud.student_nombre}</h4>
                              <p className="text-sm text-gray-600">{solicitud.materia}</p>
                              {solicitud.motivo_rechazo && (
                                <p className="text-xs text-gray-500 mt-1">Motivo: {solicitud.motivo_rechazo}</p>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-red-100 text-red-700 border-red-300">Rechazada</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <XCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No tienes solicitudes rechazadas</p>
                    <p className="text-sm">Las solicitudes rechazadas aparecerán aquí</p>
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
