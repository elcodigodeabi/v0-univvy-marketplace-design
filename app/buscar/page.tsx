"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  ArrowLeft, 
  Star, 
  MapPin, 
  BookOpen, 
  Loader2, 
  Users,
  GraduationCap,
  X,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SearchResult {
  id: string
  nombre: string
  avatar_url: string | null
  universidad: string
  carrera: string
  especialidades: string[]
  rating: number
  sesiones_completadas: number
  precio_por_hora: number
  relevanceScore: number
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// Calculate relevance score based on search query
function calculateRelevanceScore(result: SearchResult, query: string): number {
  const queryLower = query.toLowerCase().trim()
  if (!queryLower) return 0

  let score = 0
  const queryWords = queryLower.split(/\s+/)

  // Check nombre (name) - highest priority
  const nombreLower = result.nombre.toLowerCase()
  if (nombreLower === queryLower) {
    score += 100
  } else if (nombreLower.startsWith(queryLower)) {
    score += 80
  } else if (nombreLower.includes(queryLower)) {
    score += 60
  }

  // Check especialidades (subjects) - high priority
  result.especialidades.forEach((esp) => {
    const espLower = esp.toLowerCase()
    if (espLower === queryLower) {
      score += 90
    } else if (espLower.startsWith(queryLower)) {
      score += 70
    } else if (espLower.includes(queryLower)) {
      score += 50
    }
    // Check each query word
    queryWords.forEach((word) => {
      if (espLower.includes(word) && word.length > 2) {
        score += 30
      }
    })
  })

  // Check universidad - medium priority
  const uniLower = result.universidad.toLowerCase()
  if (uniLower.includes(queryLower)) {
    score += 40
  }
  queryWords.forEach((word) => {
    if (uniLower.includes(word) && word.length > 2) {
      score += 20
    }
  })

  // Check carrera - medium priority
  const carreraLower = result.carrera.toLowerCase()
  if (carreraLower.includes(queryLower)) {
    score += 35
  }
  queryWords.forEach((word) => {
    if (carreraLower.includes(word) && word.length > 2) {
      score += 15
    }
  })

  // Boost by rating and sessions
  score += result.rating * 2
  score += Math.min(result.sesiones_completadas * 0.5, 10)

  return score
}

export default function BuscarPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedAsesor, setSelectedAsesor] = useState<SearchResult | null>(null)

  const debouncedQuery = useDebounce(searchQuery, 300)

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("univvy_recent_searches")
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5))
      } catch {
        setRecentSearches([])
      }
    }
  }, [])

  // Save recent search
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5)
      localStorage.setItem("univvy_recent_searches", JSON.stringify(updated))
      return updated
    })
  }, [])

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)

    const supabase = createClient()

    try {
      // Fetch all asesores and filter/score client-side for better relevance
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, universidad, carrera, especialidades, rating, sesiones_completadas, precio_por_hora")
        .eq("role", "asesor")

      if (error) {
        console.log("[v0] Search error:", error.message)
        setResults([])
        return
      }

      if (!data || data.length === 0) {
        setResults([])
        return
      }

      // Map and calculate relevance scores
      const queryLower = query.toLowerCase().trim()
      const scoredResults: SearchResult[] = data
        .map((profile: any) => {
          const result: SearchResult = {
            id: profile.id,
            nombre: profile.full_name || "Sin nombre",
            avatar_url: profile.avatar_url,
            universidad: profile.universidad || "Sin universidad",
            carrera: profile.carrera || "Sin carrera",
            especialidades: profile.especialidades || [],
            rating: profile.rating || 0,
            sesiones_completadas: profile.sesiones_completadas || 0,
            precio_por_hora: profile.precio_por_hora || 0,
            relevanceScore: 0,
          }
          result.relevanceScore = calculateRelevanceScore(result, query)
          return result
        })
        .filter((result) => {
          // Filter results that have any match
          const nombreMatch = result.nombre.toLowerCase().includes(queryLower)
          const uniMatch = result.universidad.toLowerCase().includes(queryLower)
          const carreraMatch = result.carrera.toLowerCase().includes(queryLower)
          const espMatch = result.especialidades.some((esp) => 
            esp.toLowerCase().includes(queryLower)
          )
          // Also check individual words
          const queryWords = queryLower.split(/\s+/)
          const wordMatch = queryWords.some((word) => {
            if (word.length < 3) return false
            return (
              result.nombre.toLowerCase().includes(word) ||
              result.universidad.toLowerCase().includes(word) ||
              result.carrera.toLowerCase().includes(word) ||
              result.especialidades.some((esp) => esp.toLowerCase().includes(word))
            )
          })
          return nombreMatch || uniMatch || carreraMatch || espMatch || wordMatch
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore)

      setResults(scoredResults)
      saveRecentSearch(query)
    } catch (err) {
      console.log("[v0] Search exception:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [saveRecentSearch])

  // Trigger search when debounced query changes
  useEffect(() => {
    performSearch(debouncedQuery)
  }, [debouncedQuery, performSearch])

  const handleResultClick = (result: SearchResult) => {
    setSelectedAsesor(result)
  }

  const handleCloseDetail = () => {
    setSelectedAsesor(null)
  }

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("univvy_recent_searches")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-red-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar materias, profesores o universidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <Link href="/dashboard" className="hidden md:flex items-center gap-2">
              <img 
                src="/univvy-logo.png" 
                alt="Univvy" 
                className="h-10 w-auto" 
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Asesor Detail Panel */}
      {selectedAsesor && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50"
            onClick={handleCloseDetail}
          />
          {/* Panel */}
          <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <button
                onClick={handleCloseDetail}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="font-medium">Cerrar</span>
              </button>
              <Link
                href={`/asesores/${selectedAsesor.id}`}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Ver perfil completo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Panel Content */}
            <div className="flex-1 p-6 space-y-6">
              {/* Asesor Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-24 w-24 flex-shrink-0">
                  <AvatarImage src={selectedAsesor.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-red-100 text-red-600 text-2xl">
                    {selectedAsesor.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedAsesor.nombre}</h2>
                  <p className="text-gray-600 mb-2">{selectedAsesor.carrera}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{selectedAsesor.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({selectedAsesor.sesiones_completadas} sesiones)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Universidad */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Universidad</h3>
                <div className="flex items-center gap-2 text-gray-900">
                  <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span className="font-medium">{selectedAsesor.universidad}</span>
                </div>
              </div>

              <Separator />

              {/* Materias */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Materias que dicta</h3>
                {selectedAsesor.especialidades.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAsesor.especialidades.map((esp, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1"
                      >
                        <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                        {esp}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No especificadas</p>
                )}
              </div>

              <Separator />

              {/* Precio */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Precio por hora</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      S/ {selectedAsesor.precio_por_hora.toLocaleString()}
                    </span>
                    <span className="text-gray-500">/hora</span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-green-700 font-medium">Primera sesión</p>
                  <p className="text-sm font-bold text-green-800">20% OFF</p>
                </div>
              </div>

              {/* What's included */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">¿Qué incluye?</h4>
                {[
                  "Sesión personalizada uno a uno",
                  "Material de apoyo incluido",
                  "Seguimiento post-sesión",
                  "Garantía de satisfacción",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Panel Footer - CTA */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-3">
              <Button
                asChild
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                <Link href={`/agendar/${selectedAsesor.id}`}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Reservar clase
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 bg-transparent"
                size="lg"
                asChild
              >
                <Link href={`/asesores/${selectedAsesor.id}`}>
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Ver perfil completo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
            <p className="text-gray-600">Buscando...</p>
          </div>
        )}

        {/* No Search Yet - Show Recent Searches */}
        {!loading && !hasSearched && (
          <div className="max-w-2xl mx-auto">
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Búsquedas recientes</h2>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRecentSearchClick(search)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-red-300 hover:text-red-600 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Categories */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías populares</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Matemáticas",
                  "Física",
                  "Química",
                  "Programación",
                  "Estadística",
                  "Cálculo",
                  "Inglés",
                  "Economía",
                  "Contabilidad"
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSearchQuery(category)}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="font-medium text-gray-900">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="mb-6">
              <p className="text-gray-600">
                {results.length > 0 ? (
                  <>
                    <span className="font-semibold text-gray-900">{results.length}</span> resultados para{" "}
                    <span className="font-semibold text-gray-900">"{searchQuery}"</span>
                  </>
                ) : (
                  <>No se encontraron resultados para "{searchQuery}"</>
                )}
              </p>
            </div>

            {/* No Results */}
            {results.length === 0 && (
              <Card className="border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-600 text-center max-w-md mb-4">
                    Intenta con otros términos de búsqueda o explora nuestras categorías populares.
                  </p>
                  <Button
                    variant="outline"
                    className="border-gray-300"
                    onClick={() => setSearchQuery("")}
                  >
                    Limpiar búsqueda
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results Grid */}
            {results.length > 0 && (
              <div className="grid gap-4">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="border-gray-200 hover:shadow-lg hover:border-red-200 transition-all cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-20 w-20 flex-shrink-0">
                          <AvatarImage src={result.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-red-100 text-red-600 text-xl">
                            {result.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {result.nombre}
                              </h3>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-gray-900">
                                  {result.rating.toFixed(1)}
                                </span>
                                <span className="text-gray-500">
                                  ({result.sesiones_completadas} sesiones)
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xl font-bold text-gray-900">
                                ${result.precio_por_hora.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-600">/hora</span>
                            </div>
                          </div>

                          {/* Especialidades */}
                          {result.especialidades.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {result.especialidades.slice(0, 4).map((esp, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs bg-red-50 text-red-700 hover:bg-red-100"
                                >
                                  {esp}
                                </Badge>
                              ))}
                              {result.especialidades.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{result.especialidades.length - 4} más
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* University & Career */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{result.universidad}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-4 w-4 text-gray-400" />
                              <span>{result.carrera}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
