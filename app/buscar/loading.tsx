import { Loader2 } from "lucide-react"

export default function BuscarLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 max-w-2xl h-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse hidden md:block" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
          <p className="text-gray-600">Cargando búsqueda...</p>
        </div>
      </main>
    </div>
  )
}
