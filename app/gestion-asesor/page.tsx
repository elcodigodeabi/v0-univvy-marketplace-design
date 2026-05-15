"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Clock,
  Plus,
  Save,
  AlertCircle,
  BookOpen,
  DollarSign,
  Menu,
  Loader2,
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { getAdvisorProfile, updateAdvisorAvailability } from "@/app/actions/advisor"

export default function GestionAsesorPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState<Record<string, any>>({})

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const result = await getAdvisorProfile(user.id)
        if (result.success) {
          setProfile(result.data)
          setAvailability(result.data?.availability || getDefaultAvailability())
        }
      } catch (err) {
        console.error("[v0] Error loading profile:", err)
        toast.error("Error al cargar el perfil")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  const getDefaultAvailability = () => ({
    Lunes: { enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    Martes: { enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    Miércoles: { enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    Jueves: { enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    Viernes: { enabled: true, slots: [{ start: "09:00", end: "13:00" }] },
    Sábado: { enabled: false, slots: [] },
    Domingo: { enabled: false, slots: [] },
  })

  const toggleDayEnabled = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day]?.enabled,
      },
    }))
  }

  const addTimeSlot = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...(prev[day]?.slots || []), { start: "09:00", end: "10:00" }],
      },
    }))
  }

  const removeTimeSlot = (day: string, index: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day]?.slots.filter((_: any, i: number) => i !== index) || [],
      },
    }))
  }

  const updateTimeSlot = (day: string, index: number, field: "start" | "end", value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day]?.slots.map((slot: any, i: number) =>
          i === index ? { ...slot, [field]: value } : slot
        ) || [],
      },
    }))
  }

  const handleSaveAvailability = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const result = await updateAdvisorAvailability(user.id, availability)
      if (result.success) {
        toast.success("Disponibilidad actualizada correctamente")
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } finally {
      setSaving(false)
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
              <Link href="/gestion-asesor" className="text-red-600 font-medium">
                Gestión
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Asesorías</h1>
          <p className="text-gray-600">Administra tu disponibilidad y configuración</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <div className="max-w-2xl">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  Disponibilidad Semanal
                </CardTitle>
                <CardDescription>Define cuándo estás disponible para atender asesorías</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {diasSemana.map((day) => (
                    <div key={day} className="pb-6 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-base font-semibold text-gray-900">{day}</Label>
                        <Switch
                          checked={availability[day]?.enabled || false}
                          onCheckedChange={() => toggleDayEnabled(day)}
                        />
                      </div>

                      {availability[day]?.enabled && (
                        <div className="space-y-3 ml-4">
                          {(availability[day]?.slots || []).map((slot: any, index: number) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => updateTimeSlot(day, index, "start", e.target.value)}
                                  className="w-24"
                                />
                                <span className="text-gray-600">-</span>
                                <Input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateTimeSlot(day, index, "end", e.target.value)}
                                  className="w-24"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeTimeSlot(day, index)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Eliminar
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addTimeSlot(day)}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir horario
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    onClick={handleSaveAvailability}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Disponibilidad
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info Card */}
            <Card className="border-gray-200 mt-6 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Información Importante</h3>
                    <p className="text-sm text-blue-800">
                      Tu disponibilidad se mostrará a los estudiantes cuando naveguen por asesores. Asegúrate de mantenerla actualizada para que los estudiantes puedan agendar sesiones en horarios en los que realmente estés disponible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
