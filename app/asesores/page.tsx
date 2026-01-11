"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Star, MapPin, Clock, BookOpen, ChevronDown, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function AsesoresPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Mock data for advisors
  const asesores = [
    {
      id: 1,
      nombre: "Ana Martínez",
      especialidades: ["Álgebra Lineal", "Cálculo Multivariable"],
      universidad: "Universidad Nacional",
      carrera: "Matemáticas",
      rating: 4.9,
      sesiones: 120,
      precio: 15000,
      modalidad: ["Virtual", "Presencial"],
      disponibilidad: "Lunes a Viernes",
      descripcion: "Estudiante de últimos semestres con experiencia en enseñanza de matemáticas.",
      avatar: "/ana-abstract-geometric.png",
    },
    {
      id: 2,
      nombre: "Diego López",
      especialidades: ["Física Mecánica", "Física de Ondas"],
      universidad: "Universidad de los Andes",
      carrera: "Ingeniería Física",
      rating: 4.8,
      sesiones: 95,
      precio: 18000,
      modalidad: ["Virtual"],
      disponibilidad: "Tardes y fines de semana",
      descripcion: "Profesor con 3 años de experiencia en tutorías de física.",
      avatar: "/diego.jpg",
    },
    {
      id: 3,
      nombre: "Laura Sánchez",
      especialidades: ["Química Orgánica", "Química Inorgánica"],
      universidad: "Universidad Javeriana",
      carrera: "Química",
      rating: 5.0,
      sesiones: 150,
      precio: 20000,
      modalidad: ["Virtual", "Presencial"],
      disponibilidad: "Lunes a Sábado",
      descripcion: "Magíster en Química con pasión por la enseñanza.",
      avatar: "/portrait-of-a-woman.png",
    },
    {
      id: 4,
      nombre: "María González",
      especialidades: ["Cálculo Diferencial", "Cálculo Integral"],
      universidad: "Universidad Nacional",
      carrera: "Ingeniería de Sistemas",
      rating: 4.7,
      sesiones: 80,
      precio: 16000,
      modalidad: ["Virtual"],
      disponibilidad: "Lunes a Viernes",
      descripcion: "Estudiante de último año enfocada en matemáticas aplicadas.",
      avatar: "/portrait-thoughtful-woman.png",
    },
    {
      id: 5,
      nombre: "Carlos Ruiz",
      especialidades: ["Programación en Java", "Estructuras de Datos"],
      universidad: "Universidad de los Andes",
      carrera: "Ingeniería de Sistemas",
      rating: 4.9,
      sesiones: 110,
      precio: 22000,
      modalidad: ["Virtual", "Presencial"],
      disponibilidad: "Fines de semana",
      descripcion: "Desarrollador senior con amplia experiencia en docencia.",
      avatar: "/portrait-carlos.png",
    },
    {
      id: 6,
      nombre: "Sofía Ramírez",
      especialidades: ["Estadística", "Probabilidad"],
      universidad: "Universidad Javeriana",
      carrera: "Estadística",
      rating: 4.8,
      sesiones: 75,
      precio: 17000,
      modalidad: ["Virtual"],
      disponibilidad: "Tardes",
      descripcion: "Especialista en análisis de datos y estadística aplicada.",
      avatar: "/abstract-geometric-shapes.png",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-red-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver al Dashboard</span>
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Univyy</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Encuentra tu Asesor Ideal</h1>
          <p className="text-gray-600">Explora asesores verificados de tu universidad</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Busca por materia, nombre o universidad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 bg-transparent"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-2 block">Universidad</Label>
                    <Select>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="nacional">Universidad Nacional</SelectItem>
                        <SelectItem value="andes">Universidad de los Andes</SelectItem>
                        <SelectItem value="javeriana">Universidad Javeriana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-2 block">Modalidad</Label>
                    <Select>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="presencial">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-2 block">Precio por Hora</Label>
                    <Select>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cualquiera">Cualquiera</SelectItem>
                        <SelectItem value="0-15000">Hasta $15,000</SelectItem>
                        <SelectItem value="15000-20000">$15,000 - $20,000</SelectItem>
                        <SelectItem value="20000+">Más de $20,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-2 block">Calificación</Label>
                    <Select>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="4.5+">4.5+ estrellas</SelectItem>
                        <SelectItem value="4.8+">4.8+ estrellas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{asesores.length}</span> asesores encontrados
          </p>
          <Select defaultValue="relevancia">
            <SelectTrigger className="w-[180px] border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevancia">Más Relevantes</SelectItem>
              <SelectItem value="rating">Mejor Calificados</SelectItem>
              <SelectItem value="sesiones">Más Experiencia</SelectItem>
              <SelectItem value="precio-asc">Menor Precio</SelectItem>
              <SelectItem value="precio-desc">Mayor Precio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advisor Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asesores.map((asesor) => (
            <Card key={asesor.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Advisor Header */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={asesor.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-red-100 text-red-600 text-lg">
                      {asesor.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{asesor.nombre}</h3>
                    <p className="text-sm text-gray-600">{asesor.carrera}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900">{asesor.rating}</span>
                      <span className="text-xs text-gray-500">({asesor.sesiones} sesiones)</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {asesor.especialidades.map((esp, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {esp}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{asesor.universidad}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{asesor.disponibilidad}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span>{asesor.modalidad.join(", ")}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{asesor.descripcion}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${asesor.precio.toLocaleString()}</span>
                    <span className="text-sm text-gray-600">/hora</span>
                  </div>
                  <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                    <Link href={`/asesores/${asesor.id}`}>Ver Perfil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
