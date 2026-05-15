"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, MessageSquare, Clock, Star, BookOpen, Menu, Bell, Users, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/user-menu"
import { useAsesores, type Asesor } from "@/hooks/use-asesores"
import { createClient } from "@/lib/supabase/client"

interface Session {
  id: string
  asesor_id: string
  asesor_nombre: string
  materia: string
  fecha: string
  hora: string
  tipo: string
  estado: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { asesores, loading: loadingAsesores } = useAsesores()
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [stats, setStats] = useState({
    sesiones_completadas: 0,
    horas_asesoria: 0,
    asesores_contactados: 0,
  })

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.id) {
        setLoadingSessions(false)
        return
      }

      const supabase = createClient()
      
      try {
        // Try to fetch upcoming sessions for the student
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("student_id", user.id)
          .gte("scheduled_date", new Date().toISOString().split("T")[0])
          .order("scheduled_date", { ascending: true })
          .limit(5)

        if (!error && data) {
          setUpcomingSessions(data.map((s: any) => ({
            id: s.id,
            asesor_id: s.asesor_id,
            asesor_nombre: s.asesor_nombre || "Asesor",
            materia: s.subject || "Asesoría",
            fecha: s.scheduled_date,
            hora: s.scheduled_time,
            tipo: s.modality || "Virtual",
            estado: s.status,
          })))
        }
      } catch (err) {
        console.log("[v0] Error fetching sessions:", err)
      } finally {
        setLoadingSessions(false)
      }
    }

    fetchSessions()
  }, [user?.id])

  // Get up to 3 recommended asesores
  const recommendedAdvisors = asesores.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
            </Link>

            {/* Desktop Navigation */}
<nav className="hidden md:flex items-center gap-6">
  <Link href="/dashboard" className="text-red-600 font-medium">
  Inicio
  </Link>
  <Link href="/buscar" className="text-gray-700 hover:text-red-600 transition-colors">
  Buscar
  </Link>
  <Link href="/asesores" className="text-gray-700 hover:text-red-600 transition-colors">
  Asesores
  </Link>
              <Link href="/mis-sesiones" className="text-gray-700 hover:text-red-600 transition-colors">
                Mis Sesiones
              </Link>
              <Link href="/mensajes" className="text-gray-700 hover:text-red-600 transition-colors">
                Mensajes
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-700" />
              </Button>

              <UserMenu variant="alumno" />

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {user?.nombre?.split(" ")[0] || "Usuario"}
          </h1>
          <p className="text-gray-600">Encuentra el apoyo académico que necesitas</p>
        </div>

{/* Quick Search - Redirects to /buscar */}
  <Link href="/buscar">
  <Card className="mb-8 border-gray-200 hover:shadow-md hover:border-red-200 transition-all cursor-pointer">
  <CardContent className="p-6">
  <div className="flex gap-3">
  <div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
  <Input
  type="text"
  placeholder="Busca materias, profesores o universidades..."
  className="pl-10 border-gray-300 cursor-pointer pointer-events-none"
  readOnly
  />
  </div>
  <Button className="bg-red-600 hover:bg-red-700 text-white pointer-events-none">
  Buscar
  </Button>
  </div>
  </CardContent>
  </Card>
  </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                ) : upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((sesion) => (
                      <div
                        key={sesion.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {sesion.asesor_nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{sesion.asesor_nombre}</h4>
                            <p className="text-sm text-gray-600">{sesion.materia}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {sesion.fecha} • {sesion.hora}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {sesion.tipo}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-gray-300 bg-transparent">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="mb-4">No tienes sesiones programadas</p>
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                      <Link href="/asesores">Buscar Asesores</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Advisors */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  Asesores Disponibles
                </CardTitle>
                <CardDescription>Explora asesores verificados</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAsesores ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                ) : recommendedAdvisors.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {recommendedAdvisors.map((asesor) => (
                      <div
                        key={asesor.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={asesor.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {asesor.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{asesor.nombre}</h4>
                            <p className="text-sm text-gray-600">
                              {asesor.especialidades[0] || "Asesoría general"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{asesor.universidad}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">{asesor.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({asesor.sesiones_completadas})</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            ${asesor.precio_por_hora.toLocaleString()}/hr
                          </span>
                        </div>
                        <Button asChild size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
                          <Link href={`/asesores/${asesor.id}`}>Ver Perfil</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="mb-4">No hay asesores disponibles en este momento</p>
                    <p className="text-sm text-gray-400">Vuelve pronto para encontrar tu asesor ideal</p>
                  </div>
                )}
                
                {recommendedAdvisors.length > 0 && (
                  <div className="mt-4 text-center">
                    <Button asChild variant="outline" className="border-gray-300">
                      <Link href="/asesores">Ver todos los asesores</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Tu Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sesiones completadas</span>
                    <span className="text-2xl font-bold text-red-600">{stats.sesiones_completadas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Horas de asesoría</span>
                    <span className="text-2xl font-bold text-red-600">{stats.horas_asesoria}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Asesores contactados</span>
                    <span className="text-2xl font-bold text-red-600">{stats.asesores_contactados}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gray-200 bg-red-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                    <Link href="/asesores">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Asesor
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                    <Link href="/mensajes">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ver Mensajes
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                    <Link href="/mis-sesiones">
                      <Calendar className="mr-2 h-4 w-4" />
                      Mis Sesiones
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
