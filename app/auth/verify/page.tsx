'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const supabase = createClient()
        
        // Get token from URL fragment
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const type = params.get('type')

        if (!accessToken || type !== 'signup') {
          setStatus('error')
          setMessage('El enlace de verificación es inválido o ha expirado.')
          return
        }

        // Set the session with the verification token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') || '',
        })

        if (sessionError) {
          setStatus('error')
          setMessage('No pudimos verificar tu email. Por favor intenta de nuevo.')
          return
        }

        // Get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setStatus('error')
          setMessage('No pudimos completar la verificación.')
          return
        }

        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            nombre: user.user_metadata?.nombre || '',
            tipo: user.user_metadata?.tipo || 'alumno',
            universidad: user.user_metadata?.universidad || '',
            carrera: user.user_metadata?.carrera || '',
            updated_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error('[v0] Profile creation error:', profileError)
        }

        setStatus('success')
        setMessage('¡Email verificado exitosamente!')
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (err) {
        console.error('[v0] Verification error:', err)
        setStatus('error')
        setMessage('Ocurrió un error al verificar tu email.')
      }
    }

    verifyEmail()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Verificando email...</h1>
            <p className="text-gray-600">Por favor espera mientras verificamos tu dirección de correo</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">¡Verificación Exitosa!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">Te redireccionaremos en unos segundos...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h1 className="text-lg font-semibold text-red-900 mb-1">Verificación Fallida</h1>
                  <p className="text-red-700">{message}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <a
                  href="/registro"
                  className="block text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Registrarse de Nuevo
                </a>
                <a
                  href="/login"
                  className="block text-center bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
