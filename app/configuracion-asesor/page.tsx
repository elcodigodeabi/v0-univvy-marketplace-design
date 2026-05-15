"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, X, Save, DollarSign, BookOpen, Settings } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function ConfiguracionAsesorPage() {
  const [materias, setMaterias] = useState([
    { id: 1, nombre: "Programación en Java", precio: 15000, duracion: 60 },
    { id: 2, nombre: "Estructuras de Datos", precio: 20000, duracion: 90 },
    { id: 3, nombre: "Algoritmos", precio: 15000, duracion: 60 },
  ])

  const [newMateria, setNewMateria] = useState({ nombre: "", precio: "", duracion: "60" })
  const [isAdding, setIsAdding] = useState(false)

  const [configuracion, setConfiguracion] = useState({
    aceptarAutomatico: false,
    notificacionesEmail: true,
    notificacionesPush: true,
    mostrarTelefono: false,
    permitirCancelacion: true,
    tiempoCancelacion: "24",
    modalidades: {
      virtual: true,
      presencial: true,
    },
  })

  const handleAddMateria = () => {
    if (newMateria.nombre && newMateria.precio) {
      setMaterias([
        ...materias,
        {
          id: materias.length + 1,
          nombre: newMateria.nombre,
          precio: Number.parseInt(newMateria.precio),
          duracion: Number.parseInt(newMateria.duracion),
        },
      ])
      setNewMateria({ nombre: "", precio: "", duracion: "60" })
      setIsAdding(false)
    }
  }

  const handleRemoveMateria = (id: number) => {
    setMaterias(materias.filter((m) => m.id !== id))
  }

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
                <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
              </Link>
            </div>
            <UserMenu variant="asesor" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Asesoría</h1>
            <p className="text-gray-600">Gestiona tus materias, precios y preferencias</p>
          </div>

          <Tabs defaultValue="materias" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="materias" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Materias y Precios
              </TabsTrigger>
              <TabsTrigger value="preferencias" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferencias
              </TabsTrigger>
              <TabsTrigger value="pagos" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Métodos de Pago
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materias">
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900">Mis Materias</CardTitle>
                      <CardDescription>Administra las materias que ofreces y sus tarifas</CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsAdding(true)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={isAdding}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Materia
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add new materia form */}
                    {isAdding && (
                      <div className="border-2 border-dashed border-red-300 rounded-lg p-4 bg-red-50">
                        <h3 className="font-semibold text-gray-900 mb-4">Nueva Materia</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Nombre de la materia</Label>
                            <Input
                              placeholder="Ej: Cálculo Diferencial"
                              value={newMateria.nombre}
                              onChange={(e) => setNewMateria({ ...newMateria, nombre: e.target.value })}
                              className="border-gray-300"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Precio por hora (COP)</Label>
                              <Input
                                type="number"
                                placeholder="15000"
                                value={newMateria.precio}
                                onChange={(e) => setNewMateria({ ...newMateria, precio: e.target.value })}
                                className="border-gray-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Duración típica (minutos)</Label>
                              <Select
                                value={newMateria.duracion}
                                onValueChange={(value) => setNewMateria({ ...newMateria, duracion: value })}
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
                          <div className="flex gap-3">
                            <Button
                              onClick={handleAddMateria}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                              Guardar Materia
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAdding(false)
                                setNewMateria({ nombre: "", precio: "", duracion: "60" })
                              }}
                              className="border-gray-300 bg-transparent"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lista de materias existentes */}
                    {materias.map((materia) => (
                      <div
                        key={materia.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{materia.nombre}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">
                              <strong>${materia.precio.toLocaleString()}</strong> / hora
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {materia.duracion} min
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-gray-300 bg-transparent">
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveMateria(materia.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {materias.length === 0 && !isAdding && (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="mb-4">No has agregado materias aún</p>
                        <Button onClick={() => setIsAdding(true)} className="bg-red-600 hover:bg-red-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Primera Materia
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferencias">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Preferencias Generales</CardTitle>
                  <CardDescription>Configura cómo deseas recibir y gestionar solicitudes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Solicitudes */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Solicitudes</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Aceptación automática</p>
                        <p className="text-sm text-gray-600">Acepta solicitudes sin revisión manual</p>
                      </div>
                      <Switch
                        checked={configuracion.aceptarAutomatico}
                        onCheckedChange={(checked) =>
                          setConfiguracion({ ...configuracion, aceptarAutomatico: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Notificaciones */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Notificaciones por email</p>
                        <p className="text-sm text-gray-600">Recibe alertas en tu correo</p>
                      </div>
                      <Switch
                        checked={configuracion.notificacionesEmail}
                        onCheckedChange={(checked) =>
                          setConfiguracion({ ...configuracion, notificacionesEmail: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Notificaciones push</p>
                        <p className="text-sm text-gray-600">Recibe alertas en el navegador</p>
                      </div>
                      <Switch
                        checked={configuracion.notificacionesPush}
                        onCheckedChange={(checked) =>
                          setConfiguracion({ ...configuracion, notificacionesPush: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Privacidad */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">Privacidad</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Mostrar teléfono en perfil</p>
                        <p className="text-sm text-gray-600">Permite que estudiantes vean tu número</p>
                      </div>
                      <Switch
                        checked={configuracion.mostrarTelefono}
                        onCheckedChange={(checked) => setConfiguracion({ ...configuracion, mostrarTelefono: checked })}
                      />
                    </div>
                  </div>

                  {/* Cancelaciones */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">Cancelaciones</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Permitir cancelación</p>
                        <p className="text-sm text-gray-600">Los estudiantes pueden cancelar sesiones</p>
                      </div>
                      <Switch
                        checked={configuracion.permitirCancelacion}
                        onCheckedChange={(checked) =>
                          setConfiguracion({ ...configuracion, permitirCancelacion: checked })
                        }
                      />
                    </div>
                    {configuracion.permitirCancelacion && (
                      <div className="space-y-2">
                        <Label>Tiempo mínimo de anticipación (horas)</Label>
                        <Select
                          value={configuracion.tiempoCancelacion}
                          onValueChange={(value) => setConfiguracion({ ...configuracion, tiempoCancelacion: value })}
                        >
                          <SelectTrigger className="border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 horas</SelectItem>
                            <SelectItem value="12">12 horas</SelectItem>
                            <SelectItem value="24">24 horas</SelectItem>
                            <SelectItem value="48">48 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Modalidades */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">Modalidades de Asesoría</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Virtual</p>
                        <p className="text-sm text-gray-600">Sesiones por videollamada</p>
                      </div>
                      <Switch
                        checked={configuracion.modalidades.virtual}
                        onCheckedChange={(checked) =>
                          setConfiguracion({
                            ...configuracion,
                            modalidades: { ...configuracion.modalidades, virtual: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Presencial</p>
                        <p className="text-sm text-gray-600">Sesiones en persona</p>
                      </div>
                      <Switch
                        checked={configuracion.modalidades.presencial}
                        onCheckedChange={(checked) =>
                          setConfiguracion({
                            ...configuracion,
                            modalidades: { ...configuracion.modalidades, presencial: checked },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Preferencias
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pagos">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Métodos de Pago</CardTitle>
                  <CardDescription>Configura cómo recibirás tus pagos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cuenta bancaria</Label>
                    <Input placeholder="Número de cuenta" className="border-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Select>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Selecciona tu banco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bancolombia">Bancolombia</SelectItem>
                          <SelectItem value="davivienda">Davivienda</SelectItem>
                          <SelectItem value="bbva">BBVA</SelectItem>
                          <SelectItem value="nequi">Nequi</SelectItem>
                          <SelectItem value="daviplata">Daviplata</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de cuenta</Label>
                      <Select>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ahorros">Ahorros</SelectItem>
                          <SelectItem value="corriente">Corriente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre del titular</Label>
                    <Input placeholder="Nombre completo" className="border-gray-300" />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-900">
                      <strong>Nota:</strong> Los pagos se procesan de forma segura a través de nuestra plataforma.
                      Recibirás tus ganancias cada 15 días.
                    </p>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Información
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
