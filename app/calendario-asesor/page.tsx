"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  MapPin,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function CalendarioAsesorPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDisponibilidadDialogOpen, setIsDisponibilidadDialogOpen] = useState(false)
  const [isBloquearDialogOpen, setIsBloquearDialogOpen] = useState(false)

  // Mock sessions data with status
  const sesiones = [
    {
      id: 1,
      fecha: "2025-01-06",
      hora: "14:00",
      duracion: 60,
      alumno: "Juan Díaz",
      materia: "Programación en Java",
      tipo: "Virtual",
      estado: "confirmada",
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      id: 2,
      fecha: "2025-01-06",
      hora: "16:00",
      duracion: 60,
      alumno: "María Rodríguez",
      materia: "Estructuras de Datos",
      tipo: "Presencial",
      estado: "pendiente",
      avatar: "/portrait-thoughtful-woman.png",
    },
    {
      id: 3,
      fecha: "2025-01-08",
      hora: "10:00",
      duracion: 60,
      alumno: "Carlos Méndez",
      materia: "Algoritmos",
      tipo: "Virtual",
      estado: "confirmada",
      avatar: "/hombre-estudiante.png",
    },
    {
      id: 4,
      fecha: "2025-01-10",
      hora: "15:00",
      duracion: 60,
      alumno: "Ana Torres",
      materia: "Programación en Java",
      tipo: "Virtual",
      estado: "confirmada",
      avatar: "/mujer-estudiante.png",
    },
    {
      id: 5,
      fecha: "2025-01-15",
      hora: "11:00",
      duracion: 60,
      alumno: "Pedro Gómez",
      materia: "Estructuras de Datos",
      tipo: "Presencial",
      estado: "pendiente",
      avatar: "/hombre-estudiante.png",
    },
  ]

  // Sesiones completadas
  const sesionesCompletadas = [
    {
      id: 101,
      fecha: "2024-12-20",
      hora: "14:00",
      alumno: "Laura Sánchez",
      materia: "Programación en Java",
      tipo: "Virtual",
      calificacion: 5,
      avatar: "/portrait-of-a-woman.png",
    },
    {
      id: 102,
      fecha: "2024-12-18",
      hora: "16:00",
      alumno: "Diego Ruiz",
      materia: "Algoritmos",
      tipo: "Presencial",
      calificacion: 5,
      avatar: "/portrait-carlos.png",
    },
    {
      id: 103,
      fecha: "2024-12-15",
      hora: "10:00",
      alumno: "Sofía Morales",
      materia: "Estructuras de Datos",
      tipo: "Virtual",
      calificacion: 4,
      avatar: "/mujer-estudiante.png",
    },
  ]

  // Mock disponibilidad
  const [disponibilidad, setDisponibilidad] = useState([
    { dia: "Lunes", horarios: ["09:00-12:00", "14:00-18:00"], activo: true },
    { dia: "Martes", horarios: ["10:00-12:00", "15:00-18:00"], activo: true },
    { dia: "Miércoles", horarios: ["09:00-12:00", "14:00-17:00"], activo: true },
    { dia: "Jueves", horarios: ["10:00-12:00", "14:00-18:00"], activo: true },
    { dia: "Viernes", horarios: ["09:00-12:00"], activo: true },
    { dia: "Sábado", horarios: [], activo: false },
    { dia: "Domingo", horarios: [], activo: false },
  ])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getSesionesForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return sesiones.filter((s) => s.fecha === dateString)
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const formatDate = (date: Date) => {
    return `${date.getDate()} de ${monthNames[date.getMonth()]}`
  }

  const proximasSesiones = sesiones.filter((s) => s.estado === "confirmada").slice(0, 5)
  const sesionesPendientes = sesiones.filter((s) => s.estado === "pendiente")

  const handleSaveDisponibilidad = () => {
    setIsDisponibilidadDialogOpen(false)
    toast.success("Disponibilidad actualizada", {
      description: "Tus horarios han sido guardados correctamente.",
    })
  }

  const handleBloquearHorario = () => {
    setIsBloquearDialogOpen(false)
    toast.success("Horario bloqueado", {
      description: "El horario ha sido marcado como no disponible.",
    })
  }

  // Stats
  const totalSesiones = sesiones.length + sesionesCompletadas.length
  const ingresosMes = sesiones.length * 15000
  const calificacionPromedio = (
    sesionesCompletadas.reduce((sum, s) => sum + s.calificacion, 0) / sesionesCompletadas.length
  ).toFixed(1)

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
              <Link href="/" className="flex items-center gap-2">
                <img src="/univvy-logo.jpg" alt="Univvy" className="h-10 w-auto rounded-full border border-gray-100 shadow-sm" />
              </Link>
            </div>
            <UserMenu variant="asesor" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Calendario</h1>
              <p className="text-gray-600">Gestiona tu disponibilidad y visualiza tus sesiones</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isDisponibilidadDialogOpen} onOpenChange={setIsDisponibilidadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-gray-300 bg-transparent">
                    <Clock className="h-4 w-4 mr-2" />
                    Configurar Horarios
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Configurar Disponibilidad</DialogTitle>
                    <DialogDescription>Define tus horarios disponibles para asesorías</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                    {disponibilidad.map((dia, idx) => (
                      <div key={dia.dia} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Switch
                              checked={dia.activo}
                              onCheckedChange={(checked) => {
                                const newDisp = [...disponibilidad]
                                newDisp[idx].activo = checked
                                setDisponibilidad(newDisp)
                              }}
                            />
                            <span className={`font-medium ${dia.activo ? "text-gray-900" : "text-gray-400"}`}>
                              {dia.dia}
                            </span>
                          </div>
                          {dia.activo && (
                            <div className="flex flex-wrap gap-2 ml-10">
                              {dia.horarios.map((h, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {h}
                                </Badge>
                              ))}
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-red-600">
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDisponibilidadDialogOpen(false)} className="border-gray-300 bg-transparent">
                      Cancelar
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSaveDisponibilidad}>
                      Guardar Cambios
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isBloquearDialogOpen} onOpenChange={setIsBloquearDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Bloquear Horario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bloquear Horario</DialogTitle>
                    <DialogDescription>Marca un tiempo como no disponible</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input type="date" className="border-gray-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hora inicio</Label>
                        <Input type="time" className="border-gray-300" />
                      </div>
                      <div className="space-y-2">
                        <Label>Hora fin</Label>
                        <Input type="time" className="border-gray-300" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Motivo (opcional)</Label>
                      <Input placeholder="Ej: Cita médica" className="border-gray-300" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBloquearDialogOpen(false)} className="border-gray-300 bg-transparent">
                      Cancelar
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleBloquearHorario}>
                      Bloquear Horario
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sesiones este mes</p>
                    <p className="text-2xl font-bold text-gray-900">{sesiones.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{sesionesPendientes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ingresos mes</p>
                    <p className="text-2xl font-bold text-gray-900">${ingresosMes.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Calificación</p>
                    <p className="text-2xl font-bold text-gray-900">{calificacionPromedio}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                      <CalendarIcon className="h-6 w-6 text-red-600" />
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={previousMonth} className="border-gray-300 bg-transparent">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={nextMonth} className="border-gray-300 bg-transparent">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Day names */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                      const sesionesDelDia = getSesionesForDate(date)
                      const isToday = date.toDateString() === new Date().toDateString()
                      const isSelected = selectedDate?.toDateString() === date.toDateString()
                      const hasPendientes = sesionesDelDia.some((s) => s.estado === "pendiente")
                      const hasConfirmadas = sesionesDelDia.some((s) => s.estado === "confirmada")

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square p-1 sm:p-2 rounded-lg border transition-all ${
                            isSelected
                              ? "border-red-600 bg-red-50 ring-2 ring-red-600"
                              : isToday
                              ? "border-red-400 bg-red-50"
                              : sesionesDelDia.length > 0
                              ? "border-blue-300 bg-blue-50 hover:border-blue-500"
                              : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col h-full">
                            <span className={`text-sm font-semibold ${
                              isSelected || isToday
                                ? "text-red-600"
                                : sesionesDelDia.length > 0
                                ? "text-blue-600"
                                : "text-gray-900"
                            }`}>
                              {day}
                            </span>
                            {sesionesDelDia.length > 0 && (
                              <div className="flex-1 flex items-center justify-center gap-1">
                                {hasConfirmadas && (
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                )}
                                {hasPendientes && (
                                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">Confirmada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm text-gray-600">Pendiente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-red-400 bg-red-50" />
                      <span className="text-sm text-gray-600">Hoy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sessions for selected date */}
              {selectedDate && (
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      Sesiones del {formatDate(selectedDate)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getSesionesForDate(selectedDate).length > 0 ? (
                      <div className="space-y-3">
                        {getSesionesForDate(selectedDate).map((sesion) => (
                          <div
                            key={sesion.id}
                            className={`flex items-center gap-4 p-4 border rounded-lg ${
                              sesion.estado === "pendiente"
                                ? "border-yellow-200 bg-yellow-50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {sesion.alumno.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{sesion.alumno}</h4>
                                {sesion.estado === "pendiente" ? (
                                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                    Pendiente
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 border-green-300">
                                    Confirmada
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{sesion.materia}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {sesion.hora} ({sesion.duracion} min)
                                </span>
                                {sesion.tipo === "Virtual" ? (
                                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                    <Video className="h-3 w-3" />
                                    Virtual
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Presencial
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {sesion.estado === "pendiente" && (
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No hay sesiones programadas para este día</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tabs for session lists */}
              <Card className="border-gray-200">
                <CardContent className="p-0">
                  <Tabs defaultValue="proximas" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-gray-200 bg-gray-50">
                      <TabsTrigger value="proximas" className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-red-600">
                        Próximas
                      </TabsTrigger>
                      <TabsTrigger value="pendientes" className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-red-600">
                        Pendientes
                      </TabsTrigger>
                      <TabsTrigger value="completadas" className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-red-600">
                        Completadas
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="proximas" className="p-4 m-0">
                      <div className="space-y-3">
                        {proximasSesiones.length > 0 ? (
                          proximasSesiones.map((sesion) => (
                            <div key={sesion.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                                  {sesion.alumno.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{sesion.alumno}</p>
                                <p className="text-xs text-gray-500">{sesion.fecha} - {sesion.hora}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {sesion.tipo === "Virtual" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-4 text-sm">No hay sesiones próximas</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="pendientes" className="p-4 m-0">
                      <div className="space-y-3">
                        {sesionesPendientes.length > 0 ? (
                          sesionesPendientes.map((sesion) => (
                            <div key={sesion.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                                  {sesion.alumno.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{sesion.alumno}</p>
                                <p className="text-xs text-gray-500">{sesion.fecha} - {sesion.hora}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-100">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-100">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-4 text-sm">No hay sesiones pendientes</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="completadas" className="p-4 m-0">
                      <div className="space-y-3">
                        {sesionesCompletadas.map((sesion) => (
                          <div key={sesion.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                                {sesion.alumno.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{sesion.alumno}</p>
                              <p className="text-xs text-gray-500">{sesion.fecha}</p>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < sesion.calificacion ? "text-yellow-400" : "text-gray-300"}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Disponibilidad Quick View */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-lg">Mi Disponibilidad</CardTitle>
                  <CardDescription>Horarios configurados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {disponibilidad.filter((d) => d.activo).map((disp) => (
                      <div key={disp.dia} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{disp.dia}</span>
                        <span className="text-gray-600">{disp.horarios.join(", ") || "Sin horarios"}</span>
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
                      <Link href="/solicitudes-asesor">
                        <Users className="mr-2 h-4 w-4" />
                        Ver Solicitudes
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                      <Link href="/mis-sesiones-asesor">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Mis Sesiones
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start border-gray-300 bg-white">
                      <Link href="/configuracion-asesor">
                        <Clock className="mr-2 h-4 w-4" />
                        Configuración
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
