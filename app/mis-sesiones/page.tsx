"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, MessageSquare, Video, CheckCircle, XCircle, AlertCircle, ArrowLeft, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function MisSesionesPage() {
  const [activeTab, setActiveTab] = useState("proximas")

  // Mock data for sessions
  const sesiones = {
    proximas: [
      {
        id: 1,
        asesor: "María González",
        materia: "Cálculo Diferencial",
        fecha: "2025-01-15",
        hora: "14:00",
        duracion: "1.5 horas",
        tipo: "Virtual",
        precio: 15000,
        avatar: "/portrait-thoughtful-woman.png",
        estado: "confirmada",
        link: "https://meet.google.com/abc-defg-hij",
      },
      {
        id: 2,
        asesor: "Carlos Ruiz",
        materia: "Programación en Java",
        fecha: "2025-01-17",
        hora: "16:30",
        duracion: "2 horas",
        tipo: "Presencial",
        lugar: "Biblioteca Central, Sala 3",
        precio: 20000,
        avatar: "/portrait-carlos.png",
        estado: "pendiente",
      },
    ],
    completadas: [
      {
        id: 3,
        asesor: "Ana Martínez",
        materia: "Álgebra Lineal",
        fecha: "2025-01-08",
        hora: "15:00",
        duracion: "1 hora",
        tipo: "Virtual",
        precio: 15000,
        avatar: "/ana-abstract-geometric.png",
        estado: "completada",
        calificacion: 5,
      },
      {
        id: 4,
        asesor: "Diego López",
        materia: "Física Mecánica",
        fecha: "2025-01-05",
        hora: "10:00",
        duracion: "1.5 horas",
        tipo: "Presencial",
        lugar: "Cafetería Universidad",
        precio: 18000,
        avatar: "/diego.jpg",
        estado: "completada",
        calificacion: 4,
      },
    ],
    canceladas: [
      {
        id: 5,
        asesor: "Laura Sánchez",
        materia: "Química Orgánica",
        fecha: "2025-01-03",
        hora: "11:00",
        duracion: "1 hora",
        tipo: "Virtual",
        precio: 20000,
        avatar: "/portrait-of-a-woman.png",
        estado: "cancelada",
        razon: "Conflicto de horario",
      },
    ],
  }

  const renderSesionCard = (sesion: any) => {
    const getStatusBadge = () => {
      switch (sesion.estado) {
        case "confirmada":
          return (
            <Badge className="bg-green-100 text-green-700 border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmada
            </Badge>
          )
        case "pendiente":
          return (
            <Badge className="bg-yellow-100 text-yellow-700 border-0">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pendiente
            </Badge>
          )
        case "completada":
          return (
            <Badge className="bg-blue-100 text-blue-700 border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completada
            </Badge>
          )
        case "cancelada":
          return (
            <Badge className="bg-red-100 text-red-700 border-0">
              <XCircle className="h-3 w-3 mr-1" />
              Cancelada
            </Badge>
          )
      }
    }

    return (
      <Card key={sesion.id} className="border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-red-100 text-red-600">
                  {sesion.asesor
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{sesion.asesor}</h3>
                <p className="text-sm text-gray-600 mb-2">{sesion.materia}</p>
                {getStatusBadge()}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">${sesion.precio.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{sesion.duracion}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-red-600" />
              {new Date(sesion.fecha).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-red-600" />
              {sesion.hora}
            </div>
            {sesion.tipo === "Virtual" ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4 text-red-600" />
                Sesión Virtual
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-red-600" />
                {sesion.lugar || "Presencial"}
              </div>
            )}
          </div>

          {sesion.estado === "completada" && sesion.calificacion && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700">Tu calificación:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < sesion.calificacion
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {sesion.estado === "cancelada" && sesion.razon && (
            <div className="p-3 bg-red-50 rounded-lg mb-4">
              <p className="text-sm text-red-700">
                <strong>Motivo:</strong> {sesion.razon}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {sesion.estado === "confirmada" && sesion.tipo === "Virtual" && (
              <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <a href={sesion.link} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-2" />
                  Unirse a la Sesión
                </a>
              </Button>
            )}
            {sesion.estado === "pendiente" && (
              <>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
                <Button variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
            {sesion.estado === "completada" && !sesion.calificacion && (
              <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                <Star className="h-4 w-4 mr-2" />
                Calificar Asesor
              </Button>
            )}
            <Button variant="outline" asChild className="border-gray-300 bg-transparent">
              <Link href={`/mensajes?user=${sesion.asesor}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensaje
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="text-gray-700">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <img src="/univvy-logo.jpg" alt="Univvy" className="h-10 w-auto rounded-full border border-gray-100 shadow-sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Sesiones</h1>
            <p className="text-gray-600">Gestiona todas tus asesorías académicas</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Próximas Sesiones</p>
                    <p className="text-3xl font-bold text-red-600">{sesiones.proximas.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completadas</p>
                    <p className="text-3xl font-bold text-blue-600">{sesiones.completadas.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Horas</p>
                    <p className="text-3xl font-bold text-green-600">18.5</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions Tabs */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="proximas">
                    Próximas ({sesiones.proximas.length})
                  </TabsTrigger>
                  <TabsTrigger value="completadas">
                    Completadas ({sesiones.completadas.length})
                  </TabsTrigger>
                  <TabsTrigger value="canceladas">
                    Canceladas ({sesiones.canceladas.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="proximas">
                  <div className="space-y-4">
                    {sesiones.proximas.length > 0 ? (
                      sesiones.proximas.map(renderSesionCard)
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">No tienes sesiones próximas</p>
                        <p className="text-sm mb-6">Busca asesores para programar nuevas asesorías</p>
                        <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                          <Link href="/asesores">Buscar Asesores</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="completadas">
                  <div className="space-y-4">
                    {sesiones.completadas.length > 0 ? (
                      sesiones.completadas.map(renderSesionCard)
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No tienes sesiones completadas</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="canceladas">
                  <div className="space-y-4">
                    {sesiones.canceladas.length > 0 ? (
                      sesiones.canceladas.map(renderSesionCard)
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <XCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
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
