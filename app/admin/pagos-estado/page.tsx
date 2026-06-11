'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StripeStatus {
  status: string
  account?: {
    id: string
    email: string
    country: string
    type: string
    charges_enabled: boolean
    payouts_enabled: boolean
  }
  api_version?: string
  balance?: {
    available: Array<{ amount: number; currency: string }>
    pending: Array<{ amount: number; currency: string }>
  }
  can_use_connect?: boolean
  next_steps?: string[]
  message?: string
  suggestion?: string
}

export default function StripeStatusPage() {
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/check')
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.suggestion || 'Error al conectar con Stripe')
        setStatus(null)
      } else {
        setStatus(data)
      }
    } catch (err: any) {
      setError(err.message)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estado de Stripe</h1>
            <p className="text-gray-600 mt-1">Verifica la conexión y configuración</p>
          </div>
          <Button
            onClick={fetchStatus}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Status Card */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-gray-600">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Verificando conexión...
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="h-5 w-5" />
                Error de Conexión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-red-800">{error}</p>
              <p className="text-sm text-red-700">{status?.suggestion}</p>
            </CardContent>
          </Card>
        ) : status?.status === 'connected' && status.account ? (
          <>
            {/* Connected Status */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle2 className="h-5 w-5" />
                  Conectado a Stripe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-800">Tu cuenta de Stripe está lista para usar.</p>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID de Cuenta</p>
                    <p className="font-mono text-sm text-gray-900 break-all">{status.account.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{status.account.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">País</p>
                    <p className="text-gray-900">{status.account.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Cuenta</p>
                    <Badge className="mt-1">
                      {status.account.type === 'standard' ? 'Estándar' : status.account.type}
                    </Badge>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Capacidades</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Aceptar Pagos</span>
                      <Badge variant={status.account.charges_enabled ? 'default' : 'secondary'}>
                        {status.account.charges_enabled ? '✓ Habilitado' : '✗ Deshabilitado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Recibir Pagos</span>
                      <Badge variant={status.account.payouts_enabled ? 'default' : 'secondary'}>
                        {status.account.payouts_enabled ? '✓ Habilitado' : '✗ Deshabilitado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance */}
            {status.balance && (
              <Card>
                <CardHeader>
                  <CardTitle>Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Disponible</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {status.balance.available.length > 0
                        ? `${(status.balance.available[0].amount / 100).toFixed(2)} ${status.balance.available[0].currency.toUpperCase()}`
                        : '€0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pendiente</p>
                    <p className="text-lg text-amber-600 font-semibold">
                      {status.balance.pending.length > 0
                        ? `${(status.balance.pending[0].amount / 100).toFixed(2)} ${status.balance.pending[0].currency.toUpperCase()}`
                        : '€0.00'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stripe Connect Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Stripe Connect - Próximos Pasos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-blue-900">
                  ✓ Tu cuenta puede usar Stripe Connect para crear cuentas conectadas de asesores.
                </p>
                <ul className="space-y-2">
                  {status.next_steps?.map((step, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex gap-2">
                      <span className="font-semibold">{step.split('.')[0]}.</span>
                      <span>{step.substring(step.indexOf(' ') + 1)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Connect Setup Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Cuenta Bancaria Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. En Stripe Dashboard</h3>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Ve a <code className="bg-gray-100 px-2 py-1 rounded">Settings → Bank accounts & transfers</code></li>
                    <li>Agrega tu IBAN personal</li>
                    <li>Confirma tu datos personales (NIF, nombre, dirección)</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. En Univvy (próxima implementación)</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Página admin: /admin/pagos-config</li>
                    <li>Guardar stripe_account_id, IBAN, datos personales</li>
                    <li>Generar links de onboarding para asesores</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}
