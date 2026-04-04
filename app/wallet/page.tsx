"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

// Mock data for transactions
const mockTransactions = [
  {
    id: "tx-1",
    type: "income",
    status: "completed",
    amount: 4500,
    description: "Sesion de Calculo con Juan Perez",
    date: "2026-04-03T14:00:00",
    sessionId: "session-1",
  },
  {
    id: "tx-2",
    type: "income",
    status: "escrow",
    amount: 5000,
    description: "Sesion de Fisica con Ana Lopez",
    date: "2026-04-05T10:00:00",
    sessionId: "session-2",
  },
  {
    id: "tx-3",
    type: "withdrawal",
    status: "completed",
    amount: 10000,
    description: "Retiro a cuenta BCP ***1234",
    date: "2026-04-01T09:00:00",
  },
  {
    id: "tx-4",
    type: "income",
    status: "completed",
    amount: 6000,
    description: "Sesion de Programacion con Carlos Ruiz",
    date: "2026-03-28T16:00:00",
    sessionId: "session-3",
  },
  {
    id: "tx-5",
    type: "income",
    status: "escrow",
    amount: 4500,
    description: "Sesion de Algebra con Maria Silva",
    date: "2026-04-08T11:00:00",
    sessionId: "session-4",
  },
]

const mockWalletData = {
  availableBalance: 10500, // S/105.00
  escrowBalance: 9500, // S/95.00
  totalEarnings: 45000, // S/450.00
  pendingWithdrawal: 0,
  bankAccount: {
    bank: "BCP",
    accountNumber: "***1234",
    accountHolder: "Pedro Martinez",
  },
}

export default function WalletPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)

  const formatPrice = (cents: number) => {
    return `S/${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsWithdrawing(false)
    setShowWithdrawDialog(false)
    setWithdrawAmount("")
    toast.success("Retiro solicitado exitosamente", {
      description: "Tu dinero llegara en 1-2 dias habiles.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completado
          </Badge>
        )
      case "escrow":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            En Garantia
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard-asesor">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/univvy-logo.jpg"
                  alt="Univvy"
                  className="h-10 w-auto rounded-full border border-gray-100 shadow-sm"
                />
              </Link>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Mi Billetera</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Balance Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="border-gray-200 bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-red-100">Saldo Disponible</CardDescription>
                <CardTitle className="text-3xl">{formatPrice(mockWalletData.availableBalance)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full bg-white text-red-600 hover:bg-red-50">
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Retirar Fondos
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Retirar Fondos</DialogTitle>
                      <DialogDescription>
                        Ingresa el monto que deseas retirar a tu cuenta bancaria.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Monto a retirar</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-10"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Disponible: {formatPrice(mockWalletData.availableBalance)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{mockWalletData.bankAccount.bank}</p>
                            <p className="text-sm text-gray-500">
                              Cuenta {mockWalletData.bankAccount.accountNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <p>El retiro se procesara en 1-2 dias habiles.</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
                        Cancelar
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || !withdrawAmount}
                      >
                        {isWithdrawing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          "Confirmar Retiro"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  En Garantia (Escrow)
                </CardDescription>
                <CardTitle className="text-2xl text-yellow-600">
                  {formatPrice(mockWalletData.escrowBalance)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  Este monto se liberara cuando las sesiones sean completadas satisfactoriamente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Ganancias Totales
                </CardDescription>
                <CardTitle className="text-2xl text-green-600">{formatPrice(mockWalletData.totalEarnings)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">Total acumulado desde que te uniste a Univvy.</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Historial de Transacciones
              </CardTitle>
              <CardDescription>Todas tus transacciones y movimientos</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="income">Ingresos</TabsTrigger>
                  <TabsTrigger value="withdrawals">Retiros</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {mockTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "income" ? "bg-green-100" : "bg-blue-100"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(tx.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(tx.status)}
                        <span
                          className={`font-semibold ${tx.type === "income" ? "text-green-600" : "text-blue-600"}`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatPrice(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="income" className="space-y-4">
                  {mockTransactions
                    .filter((tx) => tx.type === "income")
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tx.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(tx.date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(tx.status)}
                          <span className="font-semibold text-green-600">+{formatPrice(tx.amount)}</span>
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="withdrawals" className="space-y-4">
                  {mockTransactions
                    .filter((tx) => tx.type === "withdrawal")
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                            <ArrowUpRight className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tx.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(tx.date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(tx.status)}
                          <span className="font-semibold text-blue-600">-{formatPrice(tx.amount)}</span>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Bank Account Settings */}
          <Card className="border-gray-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cuenta Bancaria
              </CardTitle>
              <CardDescription>Configura tu cuenta para recibir pagos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{mockWalletData.bankAccount.bank}</p>
                    <p className="text-sm text-gray-500">
                      Cuenta {mockWalletData.bankAccount.accountNumber} - {mockWalletData.bankAccount.accountHolder}
                    </p>
                  </div>
                </div>
                <Button variant="outline">Editar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
