"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  Video,
  MapPin,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SelectedSlot {
  date: Date
  time: string
  dateString: string
}

export default function AgendarSesionPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([])
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [modalidad, setModalidad] = useState("virtual")
  const [notas, setNotas] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock asesor data
  const asesor = {
    id: Number.parseInt(params.id),
    nombre: "Ana Martínez",
    especialidades: ["Álgebra Lineal", "Cálculo Multivariable"],
    universidad: "Universidad Nacional",
    rating: 4.9,
    precio: 15000,
    avatar: "/ana-abstract-geometric.png",
  }

  // Mock disponibilidad por fecha
  const disponibilidadPorFecha: { [key: string]: string[] } = {
    "2025-01-06": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    "2025-01-07": ["10:00", "11:00", "15:00", "16:00", "17:00"],
    "2025-01-08": ["09:00", "10:00", "14:00", "15:00"],
    "2025-01-09": ["11:00", "14:00", "15:00", "16:00", "17:00"],
    "2025-01-10": ["09:00", "10:00", "11:00"],
    "2025-01-13": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    "2025-01-14": ["10:00", "11:00", "15:00", "16:00", "17:00"],
    "2025-01-15": ["09:00", "10:00", "14:00", "15:00", "16:00", "17:00"],
    "2025-01-16": ["11:00", "14:00", "15:00", "16:00"],
    "2025-01-17": ["09:00", "10:00", "11:00", "14:00"],
    "2025-01-20": ["09:00", "10:00", "11:00", "14:00", "15:00"],
    "2025-01-21": ["10:00", "11:00", "15:00", "16:00", "17:00"],
    "2025-01-22": ["09:00", "10:00", "14:00", "15:00", "16:00"],
    "2025-01-23": ["11:00", "14:00", "15:00", "16:00", "17:00"],
    "2025-01-24": ["09:00", "10:00", "11:00"],
  }

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

  const getDateString = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getDisponibilidadForDate = (date: Date) => {
    const dateString = getDateString(date)
    return disponibilidadPorFecha[dateString] || []
  }

  const isSlotSelected = (date: Date, time: string) => {
    const dateString = getDateString(date)
    return selectedSlots.some((slot) => slot.dateString === dateString && slot.time === time)
  }

  const toggleSlot = (date: Date, time: string) => {
    const dateString = getDateString(date)
    const exists = selectedSlots.some((slot) => slot.dateString === dateString && slot.time === time)

    if (exists) {
      setSelectedSlots(selectedSlots.filter((slot) => !(slot.dateString === dateString && slot.time === time)))
    } else {
      setSelectedSlots([...selectedSlots, { date, time, dateString }])
    }
  }

  const removeSlot = (dateString: string, time: string) => {
    setSelectedSlots(selectedSlots.filter((slot) => !(slot.dateString === dateString && slot.time === time)))
  }

  const formatDate = (date: Date) => {
    return `${date.getDate()} de ${monthNames[date.getMonth()]}`
  }

  const handleConfirmBooking = () => {
    setIsLoading(true)
    
    // Generate a session ID and redirect to payment
    const sessionId = `session-${Date.now()}`
    
    setTimeout(() => {
      setIsLoading(false)
      setIsConfirmDialogOpen(false)
      // Redirect to payment page
      router.push(`/pago/${sessionId}`)
    }, 500)
  }

  const totalCost = selectedSlots.length * asesor.precio

  const [selectedDateForSlots, setSelectedDateForSlots] = useState<Date | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild size="sm">
              <Link href={`/asesores/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al perfil
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <img src="/univvy-logo.jpg" alt="Univvy" className="h-10 w-auto rounded-full border border-gray-100 shadow-sm" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendar Sesión</h1>
            <p className="text-gray-600">Selecciona los horarios disponibles para tu asesoría</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Asesor Info Mini */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={asesor.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-red-100 text-red-600">
                        {asesor.nombre.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{asesor.nombre}</h3>
                      <p className="text-sm text-gray-600">{asesor.universidad}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">{asesor.rating}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-600">${asesor.precio.toLocaleString()}/hora</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar */}
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
                  <CardDescription>Haz clic en un día para ver los horarios disponibles</CardDescription>
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
                      const disponibilidad = getDisponibilidadForDate(date)
                      const hasDisponibilidad = disponibilidad.length > 0
                      const isToday = date.toDateString() === new Date().toDateString()
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                      const isSelected = selectedDateForSlots?.toDateString() === date.toDateString()
                      const slotsSelectedForDay = selectedSlots.filter((s) => s.dateString === getDateString(date)).length

                      return (
                        <button
                          key={day}
                          onClick={() => hasDisponibilidad && !isPast && setSelectedDateForSlots(date)}
                          disabled={!hasDisponibilidad || isPast}
                          className={`aspect-square p-1 sm:p-2 rounded-lg border transition-all relative ${
                            isPast
                              ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50"
                              : isSelected
                              ? "border-red-600 bg-red-50 ring-2 ring-red-600"
                              : hasDisponibilidad
                              ? "border-green-300 bg-green-50 hover:border-green-500 cursor-pointer"
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                          } ${isToday ? "ring-2 ring-red-300" : ""}`}
                        >
                          <div className="flex flex-col h-full items-center justify-center">
                            <span className={`text-sm font-semibold ${
                              isPast ? "text-gray-400" : isSelected ? "text-red-600" : hasDisponibilidad ? "text-green-700" : "text-gray-400"
                            }`}>
                              {day}
                            </span>
                            {hasDisponibilidad && !isPast && (
                              <span className="text-xs text-green-600 hidden sm:block">{disponibilidad.length}h</span>
                            )}
                            {slotsSelectedForDay > 0 && (
                              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white text-xs">
                                {slotsSelectedForDay}
                              </Badge>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-50 border border-green-300" />
                      <span className="text-sm text-gray-600">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
                      <span className="text-sm text-gray-600">No disponible</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots for Selected Date */}
              {selectedDateForSlots && (
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-red-600" />
                      Horarios disponibles - {formatDate(selectedDateForSlots)}
                    </CardTitle>
                    <CardDescription>Selecciona las horas que deseas agendar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {getDisponibilidadForDate(selectedDateForSlots).map((time) => {
                        const isSelected = isSlotSelected(selectedDateForSlots, time)
                        return (
                          <button
                            key={time}
                            onClick={() => toggleSlot(selectedDateForSlots, time)}
                            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                              isSelected
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-gray-200 bg-white text-gray-700 hover:border-red-400 hover:bg-red-50"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isSelected && <CheckCircle2 className="h-4 w-4" />}
                              {time}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Selected Slots & Booking */}
            <div className="space-y-6">
              {/* Selected Slots */}
              <Card className="border-gray-200 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-gray-900">Sesiones Seleccionadas</CardTitle>
                  <CardDescription>
                    {selectedSlots.length === 0 
                      ? "Selecciona horarios en el calendario" 
                      : `${selectedSlots.length} sesión${selectedSlots.length > 1 ? "es" : ""} seleccionada${selectedSlots.length > 1 ? "s" : ""}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Haz clic en un día verde y selecciona las horas que prefieras</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedSlots
                        .sort((a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime() || a.time.localeCompare(b.time))
                        .map((slot) => (
                          <div
                            key={`${slot.dateString}-${slot.time}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{formatDate(slot.date)}</p>
                              <p className="text-sm text-gray-600">{slot.time} - {parseInt(slot.time.split(":")[0]) + 1}:00</p>
                            </div>
                            <button
                              onClick={() => removeSlot(slot.dateString, slot.time)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {selectedSlots.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 mt-4 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Precio por hora</span>
                          <span className="font-medium text-gray-900">${asesor.precio.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-red-600">${totalCost.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                        size="lg"
                        onClick={() => setIsConfirmDialogOpen(true)}
                      >
                        <Calendar className="mr-2 h-5 w-5" />
                        Agendar {selectedSlots.length > 1 ? "Clases" : "Clase"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-gray-200 bg-red-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Tips para tu sesión</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Prepara tus dudas con anticipación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Ten tu material de estudio a la mano</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Conéctate 5 min antes si es virtual</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Confirmar Agendamiento</DialogTitle>
            <DialogDescription>
              Estás a punto de agendar {selectedSlots.length} sesión{selectedSlots.length > 1 ? "es" : ""} con {asesor.nombre}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Sessions Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
              {selectedSlots
                .sort((a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime())
                .map((slot) => (
                  <div key={`${slot.dateString}-${slot.time}`} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{formatDate(slot.date)}</span>
                    <span className="font-medium text-gray-900">{slot.time}</span>
                  </div>
                ))}
            </div>

            {/* Modalidad Selection */}
            <div className="space-y-3">
              <Label className="text-gray-900">Modalidad de la sesión</Label>
              <RadioGroup value={modalidad} onValueChange={setModalidad} className="grid grid-cols-2 gap-3">
                <Label
                  htmlFor="virtual"
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    modalidad === "virtual" ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="virtual" id="virtual" className="border-gray-300" />
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Virtual</span>
                  </div>
                </Label>
                <Label
                  htmlFor="presencial"
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    modalidad === "presencial" ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="presencial" id="presencial" className="border-gray-300" />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Presencial</span>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notas" className="text-gray-900">Notas para el asesor (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Temas que quieres repasar, dudas específicas..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="border-gray-300 resize-none"
                rows={3}
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total a pagar</span>
              <span className="text-2xl font-bold text-red-600">${totalCost.toLocaleString()}</span>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
              className="border-gray-300 bg-transparent"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmBooking}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirmar Agendamiento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
