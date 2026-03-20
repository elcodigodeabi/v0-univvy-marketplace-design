"use client"
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
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { UserSelector } from "@/components/user-selector"

export default function DashboardAsesorPage() {
  // Mock data for advisor dashboard
  const proximasSesiones = [
    {
      id: 1,
      alumno: "Juan Díaz",
      materia: "Programación en Java",
      fecha: "2025-01-15",
      hora: "14:00",
      tipo: "Virtual",
      precio: 20000,
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      id: 2,
      alumno: "María Rodríguez",
      materia: "Estructuras de Datos",
      fecha: "2025-01-15",
      hora: "17:00",
      tipo: "Presencial",
      precio: 20000,
      avatar: "/portrait-thoughtful-woman.png",
    },
  ]

  const solicitudesPendientes = [
    {
      id: 1,
      alumno: "Pedro Gómez",
      materia: "Algoritmos",
      fecha: "2025-01-18",
      hora: "16:00",
      tipo: "Virtual",
      avatar: "/hombre-estudiante.png",
    },
    {
      id: 2,
      alumno: "Ana Torres",
      materia: "Programación en Java",
      fecha: "2025-01-20",
      hora: "15:00",
      tipo: "Presencial",
      avatar: "/mujer-estudiante.png",
    },
  ]

  const estadisticas = {
    gananciasEsteMes: 450000,
    sesionesMes: 23,
    promedioCalificacion: 4.9,
    estudiantesActivos: 18,
    tasaAceptacion: 95,
    horasEsteMes: 34.5,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/univvy-logo.jpg" alt="Univvy" className="h-10 w-auto rounded-full border border-gray-100 shadow-sm" />
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
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-700" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
              </Button>

              <UserSelector />

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Asesor</h1>
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
              <p className="text-2xl font-bold text-gray-900">${estadisticas.gananciasEsteMes.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Sesiones Este Mes</p>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.sesionesMes}</p>
              <p className="text-xs text-gray-500 mt-1">{estadisticas.horasEsteMes} horas totales</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Calificación Promedio</p>
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{estadisticas.promedioCalificacion}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Basado en 120 reseñas</p>
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
              <p className="text-2xl font-bold text-gray-900">{estadisticas.estudiantesActivos}</p>
              <p className="text-xs text-gray-500 mt-1">{estadisticas.tasaAceptacion}% tasa de aceptación</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Requests */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Solicitudes Pendientes
                  <Badge className="ml-2 bg-red-600 text-white">{solicitudesPendientes.length}</Badge>
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
                            <AvatarImage src={solicitud.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {solicitud.alumno
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{solicitud.alumno}</h4>
                            <p className="text-sm text-gray-600">{solicitud.materia}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {solicitud.fecha}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {solicitud.hora}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {solicitud.tipo}
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
                            <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {sesion.alumno
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{sesion.alumno}</h4>
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
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">${sesion.precio.toLocaleString()}</p>
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Performance Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Tu Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tasa de Aceptación</span>
                      <span className="text-sm font-semibold text-gray-900">{estadisticas.tasaAceptacion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${estadisticas.tasaAceptacion}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Satisfacción</span>
                      <span className="text-sm font-semibold text-gray-900">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tiempo de Respuesta</span>
                      <span className="text-sm font-semibold text-gray-900">Excelente</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
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
                    <Link href="/perfil">
                      <User className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                    <Link href="/gestion-asesor">
                      <Clock className="mr-2 h-4 w-4" />
                      Gestionar Horarios
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                    <Link href="/estadisticas">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Ver Estadísticas
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                    <Link href="/calendario-asesor">
                      <Clock className="mr-2 h-4 w-4" />
                      Ver Calendario
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                    <Link href="/configuracion-asesor">
                      <User className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-gray-200 bg-blue-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">💡 Consejo del Día</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Responde a las solicitudes en menos de 24 horas para mejorar tu tasa de conversión y ranking en la
                  plataforma.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
