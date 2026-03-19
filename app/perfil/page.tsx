"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Camera,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Clock,
  DollarSign,
  Save,
  Star,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  const [userType, setUserType] = useState<"alumno" | "asesor">("alumno")
  const [isEditing, setIsEditing] = useState(false)

  // Mock profile data
  const [profileData, setProfileData] = useState({
    nombre: "Juan Díaz",
    email: "juan.diaz@universidad.edu",
    telefono: "+57 300 123 4567",
    universidad: "Universidad Nacional de Colombia",
    carrera: "Ingeniería de Sistemas",
    semestre: "6",
    ciudad: "Bogotá",
    biografia: "Estudiante apasionado por la tecnología y el desarrollo de software.",
    // Advisor specific fields
    materias: ["Programación en Java", "Estructuras de Datos", "Algoritmos"],
    precioHora: "15000",
    modalidades: ["Virtual", "Presencial"],
    horarios: "Lunes a Viernes: 2pm - 8pm, Sábados: 10am - 2pm",
    experiencia: "3 años de experiencia como tutor académico",
  })

  useEffect(() => {
    const savedUser = localStorage.getItem("univyy-current-user")
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setUserType(user.rol)
      if (user.rol === "asesor") {
        setProfileData({
          ...profileData,
          nombre: "Pedro Martínez",
          email: "pedro.martinez@universidad.edu",
        })
      }
    }
  }, [])

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
            <Link href="/" className="flex items-center gap-2">
              <img src="/univvy-logo.jpg" alt="Univvy" className="h-10 w-auto rounded-full border border-gray-100 shadow-sm" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Avatar and Quick Info */}
            <div className="lg:col-span-1">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src="/abstract-geometric-shapes.png" />
                        <AvatarFallback className="bg-red-100 text-red-600 text-3xl">JD</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="icon"
                          className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-red-600 hover:bg-red-700"
                        >
                          <Camera className="h-5 w-5 text-white" />
                        </Button>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{profileData.nombre}</h2>
                    <Badge variant="secondary" className="mb-4">
                      {userType === "alumno" ? "Alumno" : "Asesor"}
                    </Badge>

                    {userType === "asesor" && (
                      <div className="w-full space-y-3 mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Calificación</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">4.9</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Sesiones</span>
                          <span className="font-semibold text-gray-900">120</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Estudiantes</span>
                          <span className="font-semibold text-gray-900">45</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`w-full mt-6 ${
                        isEditing ? "bg-gray-600 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"
                      } text-white`}
                    >
                      {isEditing ? "Cancelar" : "Editar Perfil"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="informacion" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="informacion">Información Personal</TabsTrigger>
                  <TabsTrigger value="academico">
                    {userType === "alumno" ? "Información Académica" : "Información Profesional"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="informacion">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle>Información de Contacto</CardTitle>
                      <CardDescription>Mantén tu información actualizada</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre Completo</Label>
                          <Input
                            id="nombre"
                            value={profileData.nombre}
                            disabled={!isEditing}
                            onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              disabled={!isEditing}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                              className="pl-10 border-gray-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="telefono">Teléfono</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="telefono"
                              value={profileData.telefono}
                              disabled={!isEditing}
                              onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                              className="pl-10 border-gray-300"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ciudad">Ciudad</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="ciudad"
                              value={profileData.ciudad}
                              disabled={!isEditing}
                              onChange={(e) => setProfileData({ ...profileData, ciudad: e.target.value })}
                              className="pl-10 border-gray-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="biografia">Biografía</Label>
                        <Textarea
                          id="biografia"
                          value={profileData.biografia}
                          disabled={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, biografia: e.target.value })}
                          rows={4}
                          className="border-gray-300"
                          placeholder="Cuéntanos sobre ti..."
                        />
                      </div>

                      {isEditing && (
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="border-gray-300 bg-transparent"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => setIsEditing(false)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="academico">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle>
                        {userType === "alumno" ? "Información Académica" : "Información Profesional"}
                      </CardTitle>
                      <CardDescription>
                        {userType === "alumno"
                          ? "Tu información educativa"
                          : "Detalles sobre tus servicios de asesoría"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="universidad">Universidad</Label>
                          <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="universidad"
                              value={profileData.universidad}
                              disabled={!isEditing}
                              onChange={(e) => setProfileData({ ...profileData, universidad: e.target.value })}
                              className="pl-10 border-gray-300"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="carrera">Carrera</Label>
                          <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="carrera"
                              value={profileData.carrera}
                              disabled={!isEditing}
                              onChange={(e) => setProfileData({ ...profileData, carrera: e.target.value })}
                              className="pl-10 border-gray-300"
                            />
                          </div>
                        </div>
                      </div>

                      {userType === "alumno" ? (
                        <div className="space-y-2">
                          <Label htmlFor="semestre">Semestre Actual</Label>
                          <Select disabled={!isEditing} value={profileData.semestre}>
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Selecciona tu semestre" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                                <SelectItem key={sem} value={sem.toString()}>
                                  Semestre {sem}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="materias">Materias que Enseñas</Label>
                            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md min-h-[60px]">
                              {profileData.materias.map((materia, index) => (
                                <Badge key={index} variant="secondary" className="bg-red-100 text-red-700">
                                  {materia}
                                </Badge>
                              ))}
                            </div>
                            {isEditing && (
                              <p className="text-xs text-gray-500">Haz clic en "Gestionar Materias" para editar</p>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="precio">Precio por Hora (COP)</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  id="precio"
                                  type="number"
                                  value={profileData.precioHora}
                                  disabled={!isEditing}
                                  onChange={(e) => setProfileData({ ...profileData, precioHora: e.target.value })}
                                  className="pl-10 border-gray-300"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="modalidades">Modalidades</Label>
                              <div className="flex gap-2 p-3 border border-gray-300 rounded-md">
                                {profileData.modalidades.map((mod, index) => (
                                  <Badge key={index} variant="secondary">
                                    {mod}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="horarios">Horarios Disponibles</Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Textarea
                                id="horarios"
                                value={profileData.horarios}
                                disabled={!isEditing}
                                onChange={(e) => setProfileData({ ...profileData, horarios: e.target.value })}
                                rows={3}
                                className="pl-10 border-gray-300"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="experiencia">Experiencia</Label>
                            <Textarea
                              id="experiencia"
                              value={profileData.experiencia}
                              disabled={!isEditing}
                              onChange={(e) => setProfileData({ ...profileData, experiencia: e.target.value })}
                              rows={3}
                              className="border-gray-300"
                              placeholder="Describe tu experiencia como asesor..."
                            />
                          </div>
                        </>
                      )}

                      {isEditing && (
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="border-gray-300 bg-transparent"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => setIsEditing(false)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
