import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"

export default function RegistroExitoPage() {
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
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">Revisa tu Correo</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-2">Pasos a seguir:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abre tu correo electrónico</li>
                <li>Busca el correo de Univvy</li>
                <li>Haz clic en el enlace de verificación</li>
                <li>Inicia sesión con tu cuenta</li>
              </ol>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
            </p>
            <Button asChild variant="outline" className="w-full border-gray-300 bg-transparent">
              <Link href="/login">Ir a Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
