"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Menu,
  Loader2,
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { getAdvisorSessions } from "@/app/actions/advisor"

export default function CalendarioAsesorPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sesiones, setSesiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Get start of month for calendar
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const result = await getAdvisorSessions(user.id)
        if (result.success) {
          setSesiones(result.data)
        }
      } catch (err) {
        console.error("[v0] Error fetching sessions:", err)
        toast.error("Error al cargar las sesiones")
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [user?.id])

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return sesiones.filter((s) => {
      const sessionDate = new Date(s.scheduled_at)
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Get upcoming sessions
  const upcomingSessions = sesiones
    .filter((s) => new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5)

  // Get completed sessions
  const completedSessions = sesiones
    .filter((s) => s.status === "completed")
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 5)

  // Handle month navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  // Generate calendar grid
  const calendarDays = []
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Empty cells before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

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
              <Link href="/dashboard-asesor" className="text-gray-700 hover:text-red-600 transition-colors">
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
              <Link href="/calendario-asesor" className="text-red-600 font-medium">
                Calendario
              </Link>
              <Link href="/mensajes" className="text-gray-700 hover:text-red-600 transition-colors">
                Mensajes
              </Link>
            </nav>

            <div className="flex items-center gap-3">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendario de Sesiones</h1>
          <p className="text-gray-600">Visualiza y gestiona tus asesorías programadas</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</CardTitle>
                      <CardDescription>{sesiones.length} sesiones totales</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={previousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="space-y-6">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-2">
                      {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"].map((day) => (
                        <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((date, index) => (
                        <div
                          key={index}
                          className={`aspect-square p-2 rounded-lg border text-center text-sm ${
                            date
                              ? date.getMonth() === currentDate.getMonth()
                                ? "border-gray-200 bg-white hover:bg-gray-50"
                                : "border-gray-100 bg-gray-50 text-gray-400"
                              : "border-transparent"
                          }`}
                        >
                          {date && (
                            <div className="h-full flex flex-col">
                              <div className="font-semibold text-gray-900">{date.getDate()}</div>
                              {date.getMonth() === currentDate.getMonth() && (
                                <div className="flex-1 flex items-end justify-center">
                                  <div className="flex gap-1 flex-wrap justify-center">
                                    {getSessionsForDate(date).slice(0, 2).map((session, i) => (
                                      <div
                                        key={i}
                                        className="h-1.5 w-1.5 rounded-full bg-red-600"
                                        title={session.student_name}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Próximas Sesiones</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div key={session.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{session.student_name}</h4>
                            <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                              <span className="ml-1">{session.status}</span>
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{session.subject || "Asesoría"}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(session.scheduled_at).toLocaleDateString("es-ES")} •{" "}
                            {new Date(session.scheduled_at).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            {session.modalidad === "virtual" ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <MapPin className="h-3 w-3" />
                            )}
                            {session.modalidad}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No hay sesiones próximas</p>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600">Sesiones Totales</p>
                      <p className="text-2xl font-bold text-gray-900">{sesiones.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Completadas</p>
                      <p className="text-2xl font-bold text-green-600">{completedSessions.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Pendientes</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {sesiones.filter((s) => s.status === "pending_payment").length}
                      </p>
                    </div>
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
