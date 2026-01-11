"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, MessageSquare, Clock, Star, BookOpen, Menu, Bell } from "lucide-react"
import { UserSelector } from "@/components/user-selector"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for upcoming sessions
  const upcomingSessions = [
    {
      id: 1,
      asesor: "María González",
      materia: "Cálculo Diferencial",
      fecha: "2025-01-12",
      hora: "14:00",
      tipo: "Virtual",
      avatar: "/portrait-thoughtful-woman.png",
    },
    {
      id: 2,
      asesor: "Carlos Ruiz",
      materia: "Programación en Java",
      fecha: "2025-01-14",
      hora: "16:30",
      tipo: "Presencial",
      avatar: "/portrait-carlos.png",
    },
  ]

  // Mock data for recommended advisors
  const recommendedAdvisors = [
    {
      id: 1,
      nombre: "Ana Martínez",
      especialidad: "Álgebra Lineal",
      universidad: "Universidad Nacional",
      rating: 4.9,
      sesiones: 120,
      precio: 15000,
      avatar: "/ana-abstract-geometric.png",
    },
    {
      id: 2,
      nombre: "Diego López",
      especialidad: "Física Mecánica",
      universidad: "Universidad de los Andes",
      rating: 4.8,
      sesiones: 95,
      precio: 18000,
      avatar: "/diego.jpg",
    },
    {
      id: 3,
      nombre: "Laura Sánchez",
      especialidad: "Química Orgánica",
      universidad: "Universidad Javeriana",
      rating: 5.0,
      sesiones: 150,
      precio: 20000,
      avatar: "/portrait-of-a-woman.png",
    },
  ]

  // Mock data for recent activity
  const recentActivity = [
    { id: 1, tipo: "sesion", descripcion: "Completaste asesoría de Cálculo", fecha: "Hace 2 días" },
    { id: 2, tipo: "mensaje", descripcion: "Nuevo mensaje de María González", fecha: "Hace 3 días" },
    { id: 3, tipo: "reserva", descripcion: "Reservaste asesoría con Carlos Ruiz", fecha: "Hace 5 días" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Univyy</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-red-600 font-medium">
                Inicio
              </Link>
              <Link href="/asesores" className="text-gray-700 hover:text-red-600 transition-colors">
                Buscar Asesores
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido, Juan</h1>
          <p className="text-gray-600">Encuentra el apoyo académico que necesitas</p>
        </div>

        {/* Quick Search */}
        <Card className="mb-8 border-gray-200">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Busca por materia, asesor o universidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white">Buscar</Button>
            </div>
          </CardContent>
        </Card>

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
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((sesion) => (
                      <div
                        key={sesion.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {sesion.asesor
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{sesion.asesor}</h4>
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
                    <p>No tienes sesiones programadas</p>
                    <Button asChild className="mt-4 bg-red-600 hover:bg-red-700 text-white">
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
                  Asesores Recomendados
                </CardTitle>
                <CardDescription>Basado en tu carrera y materias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendedAdvisors.map((asesor) => (
                    <div
                      key={asesor.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={asesor.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-red-100 text-red-600">
                            {asesor.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{asesor.nombre}</h4>
                          <p className="text-sm text-gray-600">{asesor.especialidad}</p>
                          <p className="text-xs text-gray-500 mt-1">{asesor.universidad}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">{asesor.rating}</span>
                          <span className="text-xs text-gray-500">({asesor.sesiones})</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          ${asesor.precio.toLocaleString()}/hr
                        </span>
                      </div>
                      <Button asChild size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <Link href={`/asesores/${asesor.id}`}>Ver Perfil</Link>
                      </Button>
                    </div>
                  ))}
                </div>
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
                    <span className="text-2xl font-bold text-red-600">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Horas de asesoría</span>
                    <span className="text-2xl font-bold text-red-600">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Asesores contactados</span>
                    <span className="text-2xl font-bold text-red-600">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.descripcion}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.fecha}</p>
                      </div>
                    </div>
                  ))}
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
