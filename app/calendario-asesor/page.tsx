"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ArrowLeft, ChevronLeft, ChevronRight, Clock, Plus, MapPin, Video, User } from "lucide-react"
import { UserSelector } from "@/components/user-selector"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CalendarioAsesorPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // January 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Mock sessions data
  const sesiones = [
    {
      id: 1,
      fecha: "2025-01-15",
      hora: "14:00",
      duracion: 90,
      alumno: "Juan Díaz",
      materia: "Programación en Java",
      tipo: "Virtual",
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      id: 2,
      fecha: "2025-01-15",
      hora: "17:00",
      duracion: 120,
      alumno: "María Rodríguez",
      materia: "Estructuras de Datos",
      tipo: "Presencial",
      avatar: "/portrait-thoughtful-woman.png",
    },
    {
      id: 3,
      fecha: "2025-01-16",
      hora: "10:00",
      duracion: 60,
      alumno: "Carlos Méndez",
      materia: "Algoritmos",
      tipo: "Virtual",
      avatar: "/hombre-estudiante.png",
    },
    {
      id: 4,
      fecha: "2025-01-18",
      hora: "15:00",
      duracion: 90,
      alumno: "Ana Torres",
      materia: "Programación en Java",
      tipo: "Virtual",
      avatar: "/mujer-estudiante.png",
    },
    {
      id: 5,
      fecha: "2025-01-20",
      hora: "11:00",
      duracion: 120,
      alumno: "Pedro Gómez",
      materia: "Estructuras de Datos",
      tipo: "Presencial",
      avatar: "/hombre-estudiante.png",
    },
  ]

  // Mock disponibilidad
  const disponibilidad = [
    { dia: "Lunes", horarios: ["14:00-18:00", "19:00-21:00"] },
    { dia: "Martes", horarios: ["14:00-20:00"] },
    { dia: "Miércoles", horarios: ["15:00-19:00"] },
    { dia: "Jueves", horarios: ["14:00-20:00"] },
    { dia: "Viernes", horarios: ["14:00-18:00"] },
    { dia: "Sábado", horarios: ["10:00-14:00"] },
  ]

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
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

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
                <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Univyy</span>
              </div>
            </div>
            <UserSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendario de Asesorías</h1>
            <p className="text-gray-600">Gestiona tu disponibilidad y visualiza tus sesiones</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-gray-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={previousMonth}
                        className="border-gray-300 bg-transparent"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextMonth}
                        className="border-gray-300 bg-transparent"
                      >
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
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square"></div>
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                      const sesionesDelDia = getSesionesForDate(date)
                      const isToday = date.toDateString() === new Date().toDateString()

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square p-2 rounded-lg border transition-all hover:border-red-400 ${
                            isToday ? "border-red-600 bg-red-50" : "border-gray-200 hover:bg-gray-50"
                          } ${sesionesDelDia.length > 0 ? "bg-blue-50" : ""}`}
                        >
                          <div className="flex flex-col h-full">
                            <span
                              className={`text-sm font-semibold ${
                                isToday ? "text-red-600" : sesionesDelDia.length > 0 ? "text-blue-600" : "text-gray-900"
                              }`}
                            >
                              {day}
                            </span>
                            {sesionesDelDia.length > 0 && (
                              <div className="flex-1 flex items-center justify-center">
                                <Badge className="text-xs bg-blue-600 text-white px-1 py-0">
                                  {sesionesDelDia.length}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-red-600 bg-red-50"></div>
                      <span className="text-sm text-gray-600">Hoy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-50 border border-gray-200"></div>
                      <span className="text-sm text-gray-600">Con sesiones</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sessions for selected date */}
              {selectedDate && (
                <Card className="border-gray-200 mt-6">
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      Sesiones del {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getSesionesForDate(selectedDate).length > 0 ? (
                      <div className="space-y-3">
                        {getSesionesForDate(selectedDate).map((sesion) => (
                          <div
                            key={sesion.id}
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {sesion.alumno
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{sesion.alumno}</h4>
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No hay sesiones programadas para este día</p>
                        <Button
                          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Bloquear Horario
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick stats */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sesiones este mes</span>
                    <span className="text-lg font-bold text-gray-900">{sesiones.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Horas totales</span>
                    <span className="text-lg font-bold text-gray-900">
                      {(sesiones.reduce((sum, s) => sum + s.duracion, 0) / 60).toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Promedio/día</span>
                    <span className="text-lg font-bold text-gray-900">2.3h</span>
                  </div>
                </CardContent>
              </Card>

              {/* Disponibilidad */}
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">Disponibilidad</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="border-gray-300 bg-transparent">
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configurar Disponibilidad</DialogTitle>
                          <DialogDescription>Define tus horarios disponibles para asesorías</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Día de la semana</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un día" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lunes">Lunes</SelectItem>
                                <SelectItem value="martes">Martes</SelectItem>
                                <SelectItem value="miercoles">Miércoles</SelectItem>
                                <SelectItem value="jueves">Jueves</SelectItem>
                                <SelectItem value="viernes">Viernes</SelectItem>
                                <SelectItem value="sabado">Sábado</SelectItem>
                                <SelectItem value="domingo">Domingo</SelectItem>
                              </SelectContent>
                            </Select>
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
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Horario
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CardDescription>Tus horarios disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {disponibilidad.map((disp) => (
                      <div key={disp.dia} className="border-b border-gray-100 pb-3 last:border-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{disp.dia}</p>
                        <div className="flex flex-wrap gap-2">
                          {disp.horarios.map((horario, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {horario}
                            </Badge>
                          ))}
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
                    <Button variant="outline" className="w-full justify-start border-gray-300 bg-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Bloquear Tiempo
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-gray-300 bg-white">
                      <Clock className="mr-2 h-4 w-4" />
                      Ver Disponibilidad
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
            </div>
          </div>
        </div>
      </main>

      {/* Dialog for blocking time */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Horario</DialogTitle>
            <DialogDescription>Marca un tiempo como no disponible en tu calendario</DialogDescription>
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
              <Input placeholder="Ej: Reunión personal" className="border-gray-300" />
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Guardar Bloqueo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
