"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Star, MapPin, Clock, BookOpen, ChevronDown, ArrowLeft, Users, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAsesores } from "@/hooks/use-asesores"

export default function AsesoresPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const { asesores, loading, error } = useAsesores()

  // Filter asesores based on search query
  const filteredAsesores = asesores.filter((asesor) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      asesor.nombre.toLowerCase().includes(searchLower) ||
      asesor.universidad.toLowerCase().includes(searchLower) ||
      asesor.especialidades.some((esp) => esp.toLowerCase().includes(searchLower))
    )
  })

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
              <img src="/univvy-logo.jpg" alt="Univvy" className="h-10 w-auto rounded-full border border-gray-100 shadow-sm" />
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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
            <p className="text-gray-600">Cargando asesores...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se pudieron cargar los asesores</h3>
              <p className="text-gray-600 text-center max-w-md mb-4">
                Hubo un problema al conectar con la base de datos. Por favor, intenta nuevamente más tarde.
              </p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAsesores.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No se encontraron resultados" : "No hay asesores disponibles"}
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {searchQuery 
                  ? "Intenta con otros términos de búsqueda o ajusta los filtros."
                  : "Aún no hay asesores registrados en la plataforma. Vuelve pronto para encontrar tu asesor ideal."
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4 border-gray-300"
                  onClick={() => setSearchQuery("")}
                >
                  Limpiar búsqueda
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!loading && !error && filteredAsesores.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredAsesores.length}</span> asesores encontrados
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
              {filteredAsesores.map((asesor) => (
                <Card key={asesor.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Advisor Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={asesor.avatar_url || "/placeholder.svg"} />
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
                          <span className="text-sm font-medium text-gray-900">{asesor.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({asesor.sesiones_completadas} sesiones)</span>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {asesor.especialidades.slice(0, 3).map((esp, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {esp}
                          </Badge>
                        ))}
                        {asesor.especialidades.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{asesor.especialidades.length - 3} más
                          </Badge>
                        )}
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
                        <span>{asesor.disponibilidad || "Disponibilidad flexible"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span>{asesor.modalidad.length > 0 ? asesor.modalidad.join(", ") : "Virtual"}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {asesor.descripcion || "Asesor disponible para ayudarte con tus estudios."}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${asesor.precio_por_hora.toLocaleString()}
                        </span>
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
          </>
        )}
      </main>
    </div>
  )
}
