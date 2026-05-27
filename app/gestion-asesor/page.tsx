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
  User,
  X,
  GraduationCap,
} from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { getAdvisorProfile, updateAdvisorAvailability, updateAdvisorProfile } from "@/app/actions/advisor"

export default function GestionAsesorPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [availability, setAvailability] = useState<Record<string, any>>({})
  
  // Profile fields
  const [bio, setBio] = useState("")
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [newEspecialidad, setNewEspecialidad] = useState("")
  const [precioPorHora, setPrecioPorHora] = useState("")
  const [universidad, setUniversidad] = useState("")
  const [carrera, setCarrera] = useState("")

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const result = await getAdvisorProfile(user.id)
        if (result.success && result.data) {
          setProfile(result.data)
          setAvailability(result.data.disponibilidad || getDefaultAvailability())
          setBio(result.data.bio || "")
          setEspecialidades(result.data.especialidades || [])
          setPrecioPorHora(result.data.precio_por_hora?.toString() || "")
          setUniversidad(result.data.universidad || "")
          setCarrera(result.data.carrera || "")
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

    setSavingAvailability(true)
    try {
      const result = await updateAdvisorAvailability(user.id, availability)
      if (result.success) {
        toast.success("Disponibilidad actualizada correctamente")
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } finally {
      setSavingAvailability(false)
    }
  }

  const addEspecialidad = () => {
    if (newEspecialidad.trim() && !especialidades.includes(newEspecialidad.trim())) {
      setEspecialidades([...especialidades, newEspecialidad.trim()])
      setNewEspecialidad("")
    }
  }

  const removeEspecialidad = (esp: string) => {
    setEspecialidades(especialidades.filter((e) => e !== esp))
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    setSavingProfile(true)
    try {
      const result = await updateAdvisorProfile(user.id, {
        bio,
        especialidades,
        precio_por_hora: precioPorHora ? parseInt(precioPorHora) : 0,
        universidad,
        carrera,
      })
      if (result.success) {
        toast.success("Perfil actualizado correctamente")
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } finally {
      setSavingProfile(false)
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
          <p className="text-gray-600">Administra tu disponibilidad, materias y precios</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <Tabs defaultValue="disponibilidad" className="max-w-3xl">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="disponibilidad" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Disponibilidad
              </TabsTrigger>
              <TabsTrigger value="materias" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Materias y Precios
              </TabsTrigger>
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
            </TabsList>

            {/* Disponibilidad Tab */}
            <TabsContent value="disponibilidad">
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
                                    className="w-28"
                                  />
                                  <span className="text-gray-600">-</span>
                                  <Input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => updateTimeSlot(day, index, "end", e.target.value)}
                                    className="w-28"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeTimeSlot(day, index)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
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

                  <div className="mt-8">
                    <Button
                      onClick={handleSaveAvailability}
                      disabled={savingAvailability}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {savingAvailability ? (
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
            </TabsContent>

            {/* Materias y Precios Tab */}
            <TabsContent value="materias">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-red-600" />
                    Materias y Especialidades
                  </CardTitle>
                  <CardDescription>Define las materias que ofreces y tu precio por hora</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Precio por hora */}
                  <div className="space-y-2">
                    <Label htmlFor="precio" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Precio por hora (en soles)
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">S/</span>
                      <Input
                        id="precio"
                        type="number"
                        min="0"
                        step="5"
                        value={precioPorHora}
                        onChange={(e) => setPrecioPorHora(e.target.value)}
                        placeholder="50"
                        className="w-32"
                      />
                      <span className="text-gray-500 text-sm">por hora</span>
                    </div>
                    <p className="text-sm text-gray-500">Este es el precio que verán los estudiantes cuando busquen asesores</p>
                  </div>

                  {/* Especialidades */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      Materias que ofreces
                    </Label>
                    
                    {/* Lista de especialidades actuales */}
                    <div className="flex flex-wrap gap-2">
                      {especialidades.map((esp) => (
                        <Badge
                          key={esp}
                          variant="secondary"
                          className="bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer px-3 py-1"
                          onClick={() => removeEspecialidad(esp)}
                        >
                          {esp}
                          <X className="h-3 w-3 ml-2" />
                        </Badge>
                      ))}
                      {especialidades.length === 0 && (
                        <p className="text-sm text-gray-500">No has agregado materias aún</p>
                      )}
                    </div>

                    {/* Agregar nueva especialidad */}
                    <div className="flex gap-2">
                      <Input
                        value={newEspecialidad}
                        onChange={(e) => setNewEspecialidad(e.target.value)}
                        placeholder="Ej: Cálculo, Física, Programación..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEspecialidad())}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addEspecialidad}
                        className="border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">Agrega las materias en las que puedes dar asesorías</p>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Perfil Tab */}
            <TabsContent value="perfil">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600" />
                    Información del Perfil
                  </CardTitle>
                  <CardDescription>Actualiza tu información visible para los estudiantes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Universidad */}
                  <div className="space-y-2">
                    <Label htmlFor="universidad">Universidad</Label>
                    <Input
                      id="universidad"
                      value={universidad}
                      onChange={(e) => setUniversidad(e.target.value)}
                      placeholder="Ej: Universidad Nacional Mayor de San Marcos"
                    />
                  </div>

                  {/* Carrera */}
                  <div className="space-y-2">
                    <Label htmlFor="carrera">Carrera</Label>
                    <Input
                      id="carrera"
                      value={carrera}
                      onChange={(e) => setCarrera(e.target.value)}
                      placeholder="Ej: Ingeniería de Sistemas"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Descripción / Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntale a los estudiantes sobre tu experiencia, metodología de enseñanza, etc."
                      rows={4}
                    />
                    <p className="text-sm text-gray-500">Esta descripción aparecerá en tu perfil público</p>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Perfil
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Info Card */}
        <Card className="border-gray-200 mt-6 max-w-3xl bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Información Importante</h3>
                <p className="text-sm text-blue-800">
                  Tu disponibilidad, materias y precio se mostrarán a los estudiantes cuando busquen asesores. Asegúrate de mantener la información actualizada para recibir más solicitudes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
