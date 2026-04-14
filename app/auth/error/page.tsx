import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">Error de Autenticación</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Hubo un problema al verificar tu cuenta. El enlace puede haber expirado o ya fue utilizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
              <Link href="/login">Ir a Iniciar Sesión</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-gray-300 bg-transparent">
              <Link href="/registro">Crear Nueva Cuenta</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
