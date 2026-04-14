"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Edit2,
  Save,
  Trash2,
  DollarSign,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface HorarioSlot {
  id: string
  horaInicio: string
  horaFin: string
}

interface DisponibilidadDia {
  dia: string
  activo: boolean
  horarios: HorarioSlot[]
}

interface Materia {
  id: number
  nombre: string
  descripcion: string
  precio: number
  duracion: number
  activa: boolean
}

interface BloqueoHorario {
  id: string
  fecha: string
  horaInicio: string
  horaFin: string
  motivo: string
}

export default function GestionAsesorPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // Estados para modales
  const [isAddHorarioOpen, setIsAddHorarioOpen] = useState(false)
  const [isEditMateriaOpen, setIsEditMateriaOpen] = useState(false)
  const [isBloquearOpen, setIsBloquearOpen] = useState(false)
  const [isAddMateriaOpen, setIsAddMateriaOpen] = useState(false)
  
  // Estado de edicion
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null)
  const [editingDia, setEditingDia] = useState<string | null>(null)
  
  // Nuevo horario temporal
  const [nuevoHorario, setNuevoHorario] = useState({ horaInicio: "09:00", horaFin: "10:00" })
  
  // Nueva materia temporal
  const [nuevaMateria, setNuevaMateria] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "60",
  })

  // Bloqueo temporal
  const [nuevoBloqueo, setNuevoBloqueo] = useState({
    fecha: "",
    horaInicio: "09:00",
    horaFin: "10:00",
    motivo: "",
  })

  // Disponibilidad semanal
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDia[]>([
    { dia: "Lunes", activo: true, horarios: [
      { id: "1", horaInicio: "09:00", horaFin: "12:00" },
      { id: "2", horaInicio: "14:00", horaFin: "18:00" },
    ]},
    { dia: "Martes", activo: true, horarios: [
      { id: "3", horaInicio: "10:00", horaFin: "12:00" },
      { id: "4", horaInicio: "15:00", horaFin: "18:00" },
    ]},
    { dia: "Miércoles", activo: true, horarios: [
      { id: "5", horaInicio: "09:00", horaFin: "12:00" },
      { id: "6", horaInicio: "14:00", horaFin: "17:00" },
    ]},
    { dia: "Jueves", activo: true, horarios: [
      { id: "7", horaInicio: "10:00", horaFin: "12:00" },
      { id: "8", horaInicio: "14:00", horaFin: "18:00" },
    ]},
    { dia: "Viernes", activo: true, horarios: [
      { id: "9", horaInicio: "09:00", horaFin: "13:00" },
    ]},
    { dia: "Sábado", activo: false, horarios: [] },
    { dia: "Domingo", activo: false, horarios: [] },
  ])

  // Materias
  const [materias, setMaterias] = useState<Materia[]>([
    { id: 1, nombre: "Programación en Java", descripcion: "Fundamentos y POO en Java", precio: 15000, duracion: 60, activa: true },
    { id: 2, nombre: "Estructuras de Datos", descripcion: "Listas, árboles, grafos y algoritmos", precio: 20000, duracion: 90, activa: true },
    { id: 3, nombre: "Algoritmos", descripcion: "Diseño y análisis de algoritmos", precio: 15000, duracion: 60, activa: true },
    { id: 4, nombre: "Base de Datos", descripcion: "SQL, diseño y normalización", precio: 18000, duracion: 60, activa: false },
  ])

  // Bloqueos de horario
  const [bloqueos, setBloqueos] = useState<BloqueoHorario[]>([
    { id: "b1", fecha: "2025-01-10", horaInicio: "14:00", horaFin: "18:00", motivo: "Cita médica" },
    { id: "b2", fecha: "2025-01-15", horaInicio: "09:00", horaFin: "12:00", motivo: "Examen personal" },
  ])

  // Funciones del calendario
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    return { daysInMonth, startingDayOfWeek }
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
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

  const getDateString = (date: Date) => date.toISOString().split("T")[0]

  const formatDate = (date: Date) => `${date.getDate()} de ${monthNames[date.getMonth()]}`

  // Obtener disponibilidad para un dia especifico
  const getDisponibilidadForDate = (date: Date) => {
    const dayOfWeek = date.getDay()
    const diaName = diasSemana[dayOfWeek]
    const diaConfig = disponibilidad.find(d => d.dia === diaName)
    
    if (!diaConfig || !diaConfig.activo) return null

    // Verificar si hay bloqueo para esta fecha
    const dateString = getDateString(date)
    const bloqueo = bloqueos.find(b => b.fecha === dateString)
    
    return { config: diaConfig, bloqueo }
  }

  // Generar slots de hora disponibles
  const generateTimeSlots = (horarios: HorarioSlot[]) => {
    const slots: string[] = []
    horarios.forEach(h => {
      const start = parseInt(h.horaInicio.split(":")[0])
      const end = parseInt(h.horaFin.split(":")[0])
      for (let hour = start; hour < end; hour++) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`)
      }
    })
    return slots.sort()
  }

  // Handlers para disponibilidad
  const toggleDiaActivo = (dia: string) => {
    setDisponibilidad(prev => prev.map(d => 
      d.dia === dia ? { ...d, activo: !d.activo } : d
    ))
    toast.success(`${dia} ${disponibilidad.find(d => d.dia === dia)?.activo ? "desactivado" : "activado"}`)
  }

  const addHorarioToDia = (dia: string) => {
    setEditingDia(dia)
    setNuevoHorario({ horaInicio: "09:00", horaFin: "10:00" })
    setIsAddHorarioOpen(true)
  }

  const handleSaveHorario = () => {
    if (!editingDia) return
    
    const newId = `h-${Date.now()}`
    setDisponibilidad(prev => prev.map(d => 
      d.dia === editingDia 
        ? { ...d, horarios: [...d.horarios, { id: newId, ...nuevoHorario }] }
        : d
    ))
    setIsAddHorarioOpen(false)
    toast.success("Horario agregado correctamente")
  }

  const removeHorarioFromDia = (dia: string, horarioId: string) => {
    setDisponibilidad(prev => prev.map(d => 
      d.dia === dia 
        ? { ...d, horarios: d.horarios.filter(h => h.id !== horarioId) }
        : d
    ))
    toast.success("Horario eliminado")
  }

  // Handlers para materias
  const handleAddMateria = () => {
    if (!nuevaMateria.nombre || !nuevaMateria.precio) {
      toast.error("Completa los campos requeridos")
      return
    }
    
    const newMateria: Materia = {
      id: Date.now(),
      nombre: nuevaMateria.nombre,
      descripcion: nuevaMateria.descripcion,
      precio: parseInt(nuevaMateria.precio),
      duracion: parseInt(nuevaMateria.duracion),
      activa: true,
    }
    
    setMaterias(prev => [...prev, newMateria])
    setNuevaMateria({ nombre: "", descripcion: "", precio: "", duracion: "60" })
    setIsAddMateriaOpen(false)
    toast.success("Materia agregada correctamente")
  }

  const handleEditMateria = (materia: Materia) => {
    setEditingMateria(materia)
    setIsEditMateriaOpen(true)
  }

  const handleSaveMateria = () => {
    if (!editingMateria) return
    
    setMaterias(prev => prev.map(m => 
      m.id === editingMateria.id ? editingMateria : m
    ))
    setIsEditMateriaOpen(false)
    toast.success("Materia actualizada correctamente")
  }

  const handleDeleteMateria = (id: number) => {
    setMaterias(prev => prev.filter(m => m.id !== id))
    toast.success("Materia eliminada")
  }

  const toggleMateriaActiva = (id: number) => {
    setMaterias(prev => prev.map(m => 
      m.id === id ? { ...m, activa: !m.activa } : m
    ))
  }

  // Handlers para bloqueos
  const handleAddBloqueo = () => {
    if (!nuevoBloqueo.fecha) {
      toast.error("Selecciona una fecha")
      return
    }
    
    const newBloqueo: BloqueoHorario = {
      id: `b-${Date.now()}`,
      ...nuevoBloqueo,
    }
    
    setBloqueos(prev => [...prev, newBloqueo])
    setNuevoBloqueo({ fecha: "", horaInicio: "09:00", horaFin: "10:00", motivo: "" })
    setIsBloquearOpen(false)
    toast.success("Horario bloqueado correctamente")
  }

  const removeBloqueo = (id: string) => {
    setBloqueos(prev => prev.filter(b => b.id !== id))
    toast.success("Bloqueo eliminado")
  }

  // Generar opciones de hora
  const horasOptions = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 7
    return `${hour.toString().padStart(2, "0")}:00`
  })

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Asesorías</h1>
            <p className="text-gray-600">Administra tus horarios, materias y precios</p>
          </div>

          <Tabs defaultValue="horarios" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
              <TabsTrigger value="horarios" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Calendar className="h-4 w-4" />
                Horarios
              </TabsTrigger>
              <TabsTrigger value="materias" className="flex items-center gap-2 data-[state=active]:bg-white">
                <BookOpen className="h-4 w-4" />
                Materias
              </TabsTrigger>
              <TabsTrigger value="precios" className="flex items-center gap-2 data-[state=active]:bg-white">
                <DollarSign className="h-4 w-4" />
                Precios
              </TabsTrigger>
            </TabsList>

            {/* TAB: HORARIOS */}
            <TabsContent value="horarios">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendario */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-red-600" />
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
                      <CardDescription>Visualiza tu disponibilidad y bloqueos</CardDescription>
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
                          const dispData = getDisponibilidadForDate(date)
                          const isToday = date.toDateString() === new Date().toDateString()
                          const isSelected = selectedDate?.toDateString() === date.toDateString()
                          const hasBloqueo = dispData?.bloqueo !== undefined
                          const isDisponible = dispData?.config?.activo && !hasBloqueo

                          return (
                            <button
                              key={day}
                              onClick={() => setSelectedDate(date)}
                              className={`aspect-square p-1 sm:p-2 rounded-lg border transition-all relative ${
                                isSelected
                                  ? "border-red-600 bg-red-50 ring-2 ring-red-600"
                                  : hasBloqueo
                                  ? "border-orange-300 bg-orange-50"
                                  : isDisponible
                                  ? "border-green-300 bg-green-50 hover:border-green-500"
                                  : "border-gray-200 bg-gray-100"
                              } ${isToday ? "ring-2 ring-red-300" : ""}`}
                            >
                              <div className="flex flex-col h-full items-center justify-center">
                                <span className={`text-sm font-semibold ${
                                  isSelected ? "text-red-600" 
                                  : hasBloqueo ? "text-orange-600"
                                  : isDisponible ? "text-green-700" 
                                  : "text-gray-400"
                                }`}>
                                  {day}
                                </span>
                                {hasBloqueo && (
                                  <AlertCircle className="h-3 w-3 text-orange-500 mt-1" />
                                )}
                                {isDisponible && dispData?.config && (
                                  <span className="text-xs text-green-600 hidden sm:block">
                                    {generateTimeSlots(dispData.config.horarios).length}h
                                  </span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-50 border border-green-300" />
                          <span className="text-sm text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-orange-50 border border-orange-300" />
                          <span className="text-sm text-gray-600">Bloqueado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
                          <span className="text-sm text-gray-600">Sin disponibilidad</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detalle del dia seleccionado */}
                  {selectedDate && (
                    <Card className="border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-red-600" />
                          {formatDate(selectedDate)} ({diasSemana[selectedDate.getDay()]})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const dispData = getDisponibilidadForDate(selectedDate)
                          
                          if (dispData?.bloqueo) {
                            return (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-orange-700 mb-2">
                                  <AlertCircle className="h-5 w-5" />
                                  <span className="font-semibold">Horario bloqueado</span>
                                </div>
                                <p className="text-gray-600">{dispData.bloqueo.horaInicio} - {dispData.bloqueo.horaFin}</p>
                                {dispData.bloqueo.motivo && (
                                  <p className="text-sm text-gray-500 mt-1">Motivo: {dispData.bloqueo.motivo}</p>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100 bg-transparent"
                                  onClick={() => removeBloqueo(dispData.bloqueo!.id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Quitar bloqueo
                                </Button>
                              </div>
                            )
                          }
                          
                          if (!dispData?.config?.activo) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No tienes disponibilidad configurada para {diasSemana[selectedDate.getDay()]}</p>
                                <Button 
                                  size="sm" 
                                  className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => toggleDiaActivo(diasSemana[selectedDate.getDay()])}
                                >
                                  Activar este día
                                </Button>
                              </div>
                            )
                          }
                          
                          const slots = generateTimeSlots(dispData.config.horarios)
                          return (
                            <div>
                              <p className="text-sm text-gray-600 mb-4">Horarios disponibles:</p>
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {slots.map((slot) => (
                                  <div
                                    key={slot}
                                    className="py-2 px-3 rounded-lg border border-green-300 bg-green-50 text-center text-sm font-medium text-green-700"
                                  >
                                    {slot}
                                  </div>
                                ))}
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="mt-4 border-orange-300 text-orange-700 hover:bg-orange-50 bg-transparent"
                                onClick={() => {
                                  setNuevoBloqueo(prev => ({ ...prev, fecha: getDateString(selectedDate) }))
                                  setIsBloquearOpen(true)
                                }}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Bloquear este día
                              </Button>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar - Configuracion semanal */}
                <div className="space-y-6">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-gray-900">Disponibilidad Semanal</CardTitle>
                      </div>
                      <CardDescription>Configura tus horarios por día</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {disponibilidad.map((dia) => (
                        <div key={dia.dia} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={dia.activo}
                                onCheckedChange={() => toggleDiaActivo(dia.dia)}
                              />
                              <span className={`font-medium ${dia.activo ? "text-gray-900" : "text-gray-400"}`}>
                                {dia.dia}
                              </span>
                            </div>
                            {dia.activo && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => addHorarioToDia(dia.dia)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {dia.activo && dia.horarios.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {dia.horarios.map((horario) => (
                                <div key={horario.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                                  <span className="text-sm text-gray-700">
                                    {horario.horaInicio} - {horario.horaFin}
                                  </span>
                                  <button
                                    onClick={() => removeHorarioFromDia(dia.dia, horario.id)}
                                    className="text-gray-400 hover:text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {dia.activo && dia.horarios.length === 0 && (
                            <p className="text-xs text-gray-400 mt-1">Sin horarios configurados</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Bloqueos activos */}
                  <Card className="border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-gray-900">Bloqueos Activos</CardTitle>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-300 bg-transparent"
                          onClick={() => setIsBloquearOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {bloqueos.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No tienes bloqueos activos</p>
                      ) : (
                        <div className="space-y-2">
                          {bloqueos.map((bloqueo) => (
                            <div key={bloqueo.id} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <div>
                                <p className="font-medium text-gray-900">{bloqueo.fecha}</p>
                                <p className="text-sm text-gray-600">{bloqueo.horaInicio} - {bloqueo.horaFin}</p>
                                {bloqueo.motivo && <p className="text-xs text-gray-500">{bloqueo.motivo}</p>}
                              </div>
                              <button
                                onClick={() => removeBloqueo(bloqueo.id)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB: MATERIAS */}
            <TabsContent value="materias">
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900">Mis Materias</CardTitle>
                      <CardDescription>Administra las materias que ofreces</CardDescription>
                    </div>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setIsAddMateriaOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Materia
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {materias.map((materia) => (
                      <div 
                        key={materia.id} 
                        className={`border rounded-lg p-4 transition-all ${
                          materia.activa 
                            ? "border-gray-200 bg-white" 
                            : "border-gray-200 bg-gray-50 opacity-70"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{materia.nombre}</h4>
                            {!materia.activa && (
                              <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                            )}
                          </div>
                          <Switch
                            checked={materia.activa}
                            onCheckedChange={() => toggleMateriaActiva(materia.id)}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{materia.descripcion}</p>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-gray-900">${materia.precio.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">/hora</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {materia.duracion} min
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-gray-300 bg-transparent"
                            onClick={() => handleEditMateria(materia)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() => handleDeleteMateria(materia.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {materias.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="mb-4">No has agregado materias aún</p>
                      <Button onClick={() => setIsAddMateriaOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primera Materia
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: PRECIOS */}
            <TabsContent value="precios">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Resumen de Precios</CardTitle>
                    <CardDescription>Vista general de tus tarifas por materia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {materias.filter(m => m.activa).map((materia) => (
                        <div key={materia.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{materia.nombre}</h4>
                            <p className="text-sm text-gray-500">{materia.duracion} minutos por sesión</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">${materia.precio.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">por hora</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Edición Rápida de Precios</CardTitle>
                    <CardDescription>Modifica los precios de todas tus materias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {materias.map((materia) => (
                        <div key={materia.id} className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-gray-700">{materia.nombre}</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <Input
                              type="number"
                              value={materia.precio}
                              onChange={(e) => {
                                const newPrecio = parseInt(e.target.value) || 0
                                setMaterias(prev => prev.map(m => 
                                  m.id === materia.id ? { ...m, precio: newPrecio } : m
                                ))
                              }}
                              className="w-28 border-gray-300"
                            />
                            <span className="text-gray-500 text-sm">/hr</span>
                          </div>
                        </div>
                      ))}
                      <Button 
                        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => toast.success("Precios actualizados correctamente")}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Precios
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Estadisticas de precios */}
                <Card className="border-gray-200 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Estadísticas de Precios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-700">
                          ${Math.min(...materias.map(m => m.precio)).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Precio mínimo</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">
                          ${Math.max(...materias.map(m => m.precio)).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Precio máximo</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-700">
                          ${Math.round(materias.reduce((sum, m) => sum + m.precio, 0) / materias.length).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Precio promedio</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-700">
                          {materias.filter(m => m.activa).length}
                        </p>
                        <p className="text-sm text-gray-600">Materias activas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Dialog: Agregar Horario */}
      <Dialog open={isAddHorarioOpen} onOpenChange={setIsAddHorarioOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Horario - {editingDia}</DialogTitle>
            <DialogDescription>Define un nuevo rango horario para este día</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora inicio</Label>
                <Select 
                  value={nuevoHorario.horaInicio} 
                  onValueChange={(v) => setNuevoHorario(prev => ({ ...prev, horaInicio: v }))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horasOptions.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hora fin</Label>
                <Select 
                  value={nuevoHorario.horaFin} 
                  onValueChange={(v) => setNuevoHorario(prev => ({ ...prev, horaFin: v }))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horasOptions.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddHorarioOpen(false)} className="border-gray-300 bg-transparent">
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSaveHorario}>
              Agregar Horario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Bloquear Horario */}
      <Dialog open={isBloquearOpen} onOpenChange={setIsBloquearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Horario</DialogTitle>
            <DialogDescription>Marca un tiempo como no disponible</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input 
                type="date" 
                value={nuevoBloqueo.fecha}
                onChange={(e) => setNuevoBloqueo(prev => ({ ...prev, fecha: e.target.value }))}
                className="border-gray-300" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora inicio</Label>
                <Select 
                  value={nuevoBloqueo.horaInicio} 
                  onValueChange={(v) => setNuevoBloqueo(prev => ({ ...prev, horaInicio: v }))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horasOptions.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hora fin</Label>
                <Select 
                  value={nuevoBloqueo.horaFin} 
                  onValueChange={(v) => setNuevoBloqueo(prev => ({ ...prev, horaFin: v }))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horasOptions.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input 
                placeholder="Ej: Cita médica" 
                value={nuevoBloqueo.motivo}
                onChange={(e) => setNuevoBloqueo(prev => ({ ...prev, motivo: e.target.value }))}
                className="border-gray-300" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBloquearOpen(false)} className="border-gray-300 bg-transparent">
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleAddBloqueo}>
              Bloquear Horario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Materia */}
      <Dialog open={isAddMateriaOpen} onOpenChange={setIsAddMateriaOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Materia</DialogTitle>
            <DialogDescription>Configura los detalles de la materia que deseas ofrecer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre de la materia *</Label>
              <Input 
                placeholder="Ej: Cálculo Diferencial" 
                value={nuevaMateria.nombre}
                onChange={(e) => setNuevaMateria(prev => ({ ...prev, nombre: e.target.value }))}
                className="border-gray-300" 
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea 
                placeholder="Describe brevemente qué temas cubres..." 
                value={nuevaMateria.descripcion}
                onChange={(e) => setNuevaMateria(prev => ({ ...prev, descripcion: e.target.value }))}
                className="border-gray-300" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio por hora (COP) *</Label>
                <Input 
                  type="number" 
                  placeholder="15000" 
                  value={nuevaMateria.precio}
                  onChange={(e) => setNuevaMateria(prev => ({ ...prev, precio: e.target.value }))}
                  className="border-gray-300" 
                />
              </div>
              <div className="space-y-2">
                <Label>Duración típica</Label>
                <Select 
                  value={nuevaMateria.duracion} 
                  onValueChange={(v) => setNuevaMateria(prev => ({ ...prev, duracion: v }))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMateriaOpen(false)} className="border-gray-300 bg-transparent">
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleAddMateria}>
              Agregar Materia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Materia */}
      <Dialog open={isEditMateriaOpen} onOpenChange={setIsEditMateriaOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Materia</DialogTitle>
            <DialogDescription>Modifica los detalles de la materia</DialogDescription>
          </DialogHeader>
          {editingMateria && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre de la materia</Label>
                <Input 
                  value={editingMateria.nombre}
                  onChange={(e) => setEditingMateria({ ...editingMateria, nombre: e.target.value })}
                  className="border-gray-300" 
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea 
                  value={editingMateria.descripcion}
                  onChange={(e) => setEditingMateria({ ...editingMateria, descripcion: e.target.value })}
                  className="border-gray-300" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio por hora (COP)</Label>
                  <Input 
                    type="number" 
                    value={editingMateria.precio}
                    onChange={(e) => setEditingMateria({ ...editingMateria, precio: parseInt(e.target.value) || 0 })}
                    className="border-gray-300" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duración típica</Label>
                  <Select 
                    value={editingMateria.duracion.toString()} 
                    onValueChange={(v) => setEditingMateria({ ...editingMateria, duracion: parseInt(v) })}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                      <SelectItem value="120">120 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMateriaOpen(false)} className="border-gray-300 bg-transparent">
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSaveMateria}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
