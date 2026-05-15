"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MessageSquare,
  Clock,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Bell,
  Menu,
  CheckCircle,
  AlertCircle,
  User,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/user-menu"
import { getAdvisorStats, getAdvisorSessions, getAdvisorPendingRequests } from "@/app/actions/advisor"

interface Stats {
  ganancias_mes: number
  totalCompletedSessions: number
  estudiantes_activos: number
  tasa_aceptacion: number
}

export default function DashboardAsesorPage() {
  const { user } = useAuth()
  const [proximasSesiones, setProximasSesiones] = useState<any[]>([])
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    ganancias_mes: 0,
    totalCompletedSessions: 0,
    estudiantes_activos: 0,
    tasa_aceptacion: 0,
  })

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        // Fetch stats
        const statsResult = await getAdvisorStats(user.id)
        if (statsResult.success) {
          setStats(statsResult.data)
        }

        // Fetch upcoming sessions
        const sessionsResult = await getAdvisorSessions(user.id, "confirmed")
        if (sessionsResult.success) {
          setProximasSesiones(sessionsResult.data.slice(0, 5))
        }

        // Fetch pending requests
        const pendingResult = await getAdvisorPendingRequests(user.id)
        if (pendingResult.success) {
          setSolicitudesPendientes(pendingResult.data.slice(0, 5))
        }
      } catch (err) {
        console.error("[v0] Error fetching asesor data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/univvy-icon.png" alt="Univvy" className="h-14 w-auto object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard-asesor" className="text-red-600 font-medium">
                Dashboard
              </Link>
              <Link href="/mis-sesiones-asesor" className="text-gray-700 hover:text-red-600 transition-colors">
                Mis Sesiones
              </Link>
              <Link href="/solicitudes-asesor" className="text-gray-700 hover:text-red-600 transition-colors">
                Solicitudes
              </Link>
              <Link href="/gestion-asesor" className="text-gray-700 hover:text-red-600 transition-colors">
                Gestión
              </Link>
              <Link href="/mensajes" className="text-gray-700 hover:text-red-600 transition-colors">
                Mensajes
              </Link>
              <Link href="/wallet" className="text-gray-700 hover:text-red-600 transition-colors">
                Billetera
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-700" />
                {solicitudesPendientes.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
                )}
              </Button>

              <UserMenu variant="asesor" />

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hola, {user?.full_name?.split(" ")[0] || "Asesor"}
          </h1>
          <p className="text-gray-600">Gestiona tus sesiones y monitorea tu progreso</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Ganancias Este Mes</p>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">€{stats.ganancias_mes.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Actualizado en tiempo real</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Sesiones Completadas</p>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompletedSessions}</p>
              <p className="text-xs text-gray-500 mt-1">En total</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Tasa de Aceptación</p>
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.tasa_aceptacion}%</p>
              <p className="text-xs text-gray-500 mt-1">De solicitudes aceptadas</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Estudiantes Activos</p>
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.estudiantes_activos}</p>
              <p className="text-xs text-gray-500 mt-1">Este mes</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Pending Requests */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Solicitudes Pendientes
                    {solicitudesPendientes.length > 0 && (
                      <Badge className="ml-2 bg-red-600 text-white">{solicitudesPendientes.length}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Nuevas solicitudes de asesoría</CardDescription>
                </CardHeader>
                <CardContent>
                  {solicitudesPendientes.length > 0 ? (
                    <div className="space-y-4">
                      {solicitudesPendientes.map((solicitud) => (
                        <div
                          key={solicitud.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {solicitud.student_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">{solicitud.student_name}</h4>
                              <p className="text-sm text-gray-600">{solicitud.subject || "Asesoría"}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(solicitud.scheduled_at).toLocaleDateString("es-ES")}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(solicitud.scheduled_at).toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {solicitud.modalidad}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                            >
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No tienes solicitudes pendientes</p>
                      <p className="text-sm text-gray-400 mt-2">Las nuevas solicitudes aparecerán aquí</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-5 w-5 text-red-600" />
                    Próximas Sesiones
                  </CardTitle>
                  <CardDescription>Tus asesorías programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {proximasSesiones.length > 0 ? (
                    <div className="space-y-4">
                      {proximasSesiones.map((sesion) => (
                        <div
                          key={sesion.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {sesion.student_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">{sesion.student_name}</h4>
                              <p className="text-sm text-gray-600">{sesion.subject || "Asesoría"}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(sesion.scheduled_at).toLocaleDateString("es-ES")} •{" "}
                                  {new Date(sesion.scheduled_at).toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {sesion.modalidad}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">€{(sesion.price / 100).toFixed(2)}</p>
                            </div>
                            <Button size="sm" variant="outline" className="border-gray-300 bg-transparent">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No tienes sesiones programadas</p>
                      <p className="text-sm text-gray-400 mt-2">Las sesiones confirmadas aparecerán aquí</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-gray-200 bg-red-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                  <div className="space-y-2">
                    <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
                      <Link href="/calendario-asesor">Ver Calendario</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full border-red-300 bg-transparent">
                      <Link href="/gestion-asesor">Gestionar Perfil</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
