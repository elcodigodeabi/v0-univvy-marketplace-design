"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, GraduationCap, DollarSign, Wallet, Star, CalendarCheck } from "lucide-react"
import { MonthlyClassesChart } from "@/components/admin/monthly-classes-chart"
import { getInitials } from "@/hooks/use-auth"

interface Metrics {
  totals: { students: number; advisors: number; admins: number; totalUsers: number }
  classes: { thisMonth: number; thisYear: number; total: number; monthly: { key: string; label: string; classes: number }[] }
  revenue: {
    platformRevenueCents: number
    platformRevenueThisMonthCents: number
    advisorPaidCents: number
    grossVolumeCents: number
  }
  topAdvisors: {
    id: string
    full_name: string
    avatar_url: string | null
    rating: number
    totalReviews: number
    completedClasses: number
  }[]
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(cents / 100)
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/admin/metrics")
        if (!response.ok) throw new Error("No se pudieron cargar las métricas")
        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-red-600">{error || "No hay datos disponibles"}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
        <p className="text-sm text-gray-600">Métricas clave de la plataforma Univvy</p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos de Univvy</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(metrics.revenue.platformRevenueCents)}</p>
            <p className="text-xs text-gray-500">
              {formatMoney(metrics.revenue.platformRevenueThisMonthCents)} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pagado a Asesores</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(metrics.revenue.advisorPaidCents)}</p>
            <p className="text-xs text-gray-500">Volumen bruto {formatMoney(metrics.revenue.grossVolumeCents)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clases este Mes</CardTitle>
            <CalendarCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{metrics.classes.thisMonth}</p>
            <p className="text-xs text-gray-500">{metrics.classes.thisYear} en el año</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{metrics.totals.totalUsers}</p>
            <p className="text-xs text-gray-500">
              {metrics.totals.students} alumnos · {metrics.totals.advisors} asesores
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly classes chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clases dictadas por mes</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyClassesChart data={metrics.classes.monthly} />
          </CardContent>
        </Card>

        {/* Top advisors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-red-600" />
              Asesores más populares
            </CardTitle>
            <CardDescription>Por clases completadas y calificación</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topAdvisors.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay datos suficientes</p>
            ) : (
              <ul className="space-y-4">
                {metrics.topAdvisors.slice(0, 6).map((advisor, index) => (
                  <li key={advisor.id} className="flex items-center gap-3">
                    <span className="w-4 text-sm font-semibold text-gray-400">{index + 1}</span>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={advisor.avatar_url || undefined} alt={advisor.full_name} />
                      <AvatarFallback>{getInitials(advisor.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{advisor.full_name}</p>
                      <p className="text-xs text-gray-500">{advisor.completedClasses} clases completadas</p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {advisor.rating > 0 ? advisor.rating.toFixed(1) : "—"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
