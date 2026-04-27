'use client'

import { useState } from 'react'
import { validateStripeIntegration, testCheckoutSessionCreation } from '@/app/actions/test-stripe'
import { Button } from '@/components/ui/button'

export default function StripeTestPage() {
  const [results, setResults] = useState<any>(null)
  const [checkoutTest, setCheckoutTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleValidation = async () => {
    setLoading(true)
    try {
      const result = await validateStripeIntegration()
      setResults(result)
    } catch (err: any) {
      setResults({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckoutTest = async () => {
    setLoading(true)
    try {
      const result = await testCheckoutSessionCreation()
      setCheckoutTest(result)
    } catch (err: any) {
      setCheckoutTest({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Prueba de Integración Stripe</h1>

        <div className="space-y-6">
          {/* Validation Tests */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">1. Validar Configuración</h2>
            <p className="text-muted-foreground mb-4">
              Verifica que todos los componentes de Stripe están configurados correctamente.
            </p>
            <Button onClick={handleValidation} disabled={loading}>
              {loading ? 'Validando...' : 'Validar Configuración'}
            </Button>

            {results && (
              <div className="mt-4 p-4 bg-muted rounded">
                <div className="mb-2">
                  <span className="font-semibold">Resultado:</span>
                  <span className="ml-2">
                    {results.passed} ✓ | {results.failed} ✗
                  </span>
                </div>
                <pre className="text-xs overflow-auto max-h-96 bg-background p-3 rounded">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Checkout Session Test */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">2. Crear Sesión de Checkout de Prueba</h2>
            <p className="text-muted-foreground mb-4">
              Crea una sesión de pago de prueba en Stripe para verificar la integración.
            </p>
            <Button onClick={handleCheckoutTest} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Sesión de Prueba'}
            </Button>

            {checkoutTest && (
              <div className="mt-4 p-4 bg-muted rounded">
                {checkoutTest.status === 'SUCCESS' ? (
                  <div>
                    <div className="text-green-600 font-semibold mb-2">✓ Sesión creada exitosamente</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Monto:</span>
                        <span className="ml-2">{checkoutTest.amountInEUR}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Session ID:</span>
                        <span className="ml-2 font-mono text-xs">{checkoutTest.sessionId}</span>
                      </div>
                      <a
                        href={checkoutTest.sessionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block mt-3"
                      >
                        → Ir a Stripe Checkout (tarjeta de prueba: 4242 4242 4242 4242)
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <div className="font-semibold mb-2">✗ Error</div>
                    <pre className="text-xs bg-background p-3 rounded">
                      {checkoutTest.message}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="border rounded-lg p-6 bg-muted">
            <h3 className="font-semibold mb-3">Instrucciones para Testing Completo:</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Corre "Validar Configuración" primero</li>
              <li>Si todo pasa (5/5 ✓), crea una "Sesión de Checkout"</li>
              <li>Clic en el link de Stripe Checkout</li>
              <li>
                Usa tarjeta de test: <span className="font-mono">4242 4242 4242 4242</span>
              </li>
              <li>Completa el pago con cualquier fecha futura y CVC</li>
              <li>Deberías ser redirigido a /pago/exito con booking en estado "confirmed"</li>
              <li>El webhook debe haber procesado el evento en Stripe Dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
