"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  AlertCircle,
  Loader2,
  ExternalLink,
  Link2,
  Unlink,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { setPayPalPayoutMethod, setStripePayoutMethod } from "@/app/actions/payout-method"

interface Transaction {
  id: string
  type: "income" | "withdrawal"
  status: "completed" | "escrow" | "pending"
  amount: number
  description: string
  date: string
  sessionId?: string
}

interface WalletData {
  availableBalance: number
  escrowBalance: number
  totalEarnings: number
  pendingWithdrawal: number
  bankAccount: {
    bank: string
    accountNumber: string
    accountHolder: string
  } | null
}

interface StripeConnectStatus {
  accountId: string | null
  accountType: "express" | "standard" | null
  onboardingComplete: boolean
}

type PayoutMethod = "stripe" | "paypal"

export default function WalletPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [isConnectingBank, setIsConnectingBank] = useState(false)
  const [isConnectingExisting, setIsConnectingExisting] = useState(false)
  const [isOpeningDashboard, setIsOpeningDashboard] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [walletData, setWalletData] = useState<WalletData>({
    availableBalance: 0,
    escrowBalance: 0,
    totalEarnings: 0,
    pendingWithdrawal: 0,
    bankAccount: null,
  })
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus>({
    accountId: null,
    accountType: null,
    onboardingComplete: false,
  })
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("stripe")
  const [paypalEmail, setPaypalEmail] = useState<string | null>(null)
  const [paypalEmailInput, setPaypalEmailInput] = useState("")
  const [isSavingPaypal, setIsSavingPaypal] = useState(false)
  const [isSwitchingToStripe, setIsSwitchingToStripe] = useState(false)

  const fetchStripeStatus = useCallback(async () => {
    if (!user?.id) return

    const supabase = createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "stripe_account_id, stripe_account_type, stripe_onboarding_complete, payout_method, paypal_email"
      )
      .eq("id", user.id)
      .single()

    if (profile) {
      setStripeStatus({
        accountId: profile.stripe_account_id ?? null,
        accountType: (profile.stripe_account_type as "express" | "standard" | null) ?? null,
        onboardingComplete: profile.stripe_onboarding_complete === true,
      })
      setPayoutMethod(profile.payout_method === "paypal" ? "paypal" : "stripe")
      setPaypalEmail(profile.paypal_email ?? null)
      setPaypalEmailInput(profile.paypal_email ?? "")
    }
  }, [user?.id])

  useEffect(() => {
    async function fetchWalletData() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      const supabase = createClient()

      try {
        // Try to fetch wallet data
        const { data: wallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (wallet) {
          setWalletData({
            availableBalance: wallet.available_balance || 0,
            escrowBalance: wallet.escrow_balance || 0,
            totalEarnings: wallet.total_earnings || 0,
            pendingWithdrawal: wallet.pending_withdrawal || 0,
            bankAccount: wallet.bank_account ? {
              bank: wallet.bank_account.bank,
              accountNumber: wallet.bank_account.account_number,
              accountHolder: wallet.bank_account.account_holder,
            } : null,
          })
        }

        // Try to fetch transactions
        const { data: txs } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        if (txs) {
          setTransactions(
            txs.map((tx: any) => ({
              id: tx.id,
              type: tx.type,
              status: tx.status,
              amount: tx.amount,
              description: tx.description,
              date: tx.created_at,
              sessionId: tx.session_id,
            }))
          )
        }

        await fetchStripeStatus()
      } catch (err) {
        console.log("[v0] Error fetching wallet data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [user?.id, fetchStripeStatus])

  useEffect(() => {
    const connect = searchParams.get("connect")
    const onboarding = searchParams.get("onboarding")

    if (connect === "success") {
      toast.success("Cuenta Stripe conectada", {
        description: "Ya puedes recibir pagos con tu cuenta Stripe existente.",
      })
      fetchStripeStatus()
    } else if (connect === "denied") {
      toast.info("Conexión cancelada", {
        description: "No autorizaste la conexión con tu cuenta Stripe.",
      })
    } else if (connect === "error") {
      toast.error("No se pudo conectar tu cuenta Stripe", {
        description: "Inténtalo de nuevo en unos segundos.",
      })
    } else if (onboarding === "complete") {
      toast.success("Configuración enviada", {
        description: "Estamos verificando tu cuenta Stripe.",
      })
      fetchStripeStatus()
    }

    if (connect || onboarding) {
      router.replace("/wallet")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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

  const handleAddBankAccount = async () => {
    setIsConnectingBank(true)

    try {
      const response = await fetch("/api/connect/onboard", { method: "POST" })
      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "No se pudo iniciar la configuración bancaria")
      }

      window.location.assign(data.url)
    } catch (error) {
      console.error("[v0] Bank account onboarding error:", error)
      toast.error("No se pudo abrir la configuración bancaria", {
        description:
          error instanceof Error && error.message
            ? error.message
            : "Inténtalo de nuevo en unos segundos.",
      })
      setIsConnectingBank(false)
    }
  }

  const handleConnectExistingStripe = async () => {
    setIsConnectingExisting(true)

    try {
      const response = await fetch("/api/connect/oauth/authorize", { method: "POST" })
      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "No se pudo iniciar la conexión con Stripe")
      }

      window.location.assign(data.url)
    } catch (error) {
      console.error("[v0] Stripe OAuth authorize error:", error)
      toast.error("No se pudo conectar tu cuenta Stripe", {
        description:
          error instanceof Error && error.message
            ? error.message
            : "Inténtalo de nuevo en unos segundos.",
      })
      setIsConnectingExisting(false)
    }
  }

  const handleOpenStripeDashboard = async () => {
    if (stripeStatus.accountType === "standard") {
      window.open("https://dashboard.stripe.com", "_blank", "noopener,noreferrer")
      return
    }

    setIsOpeningDashboard(true)
    try {
      const response = await fetch("/api/connect/login-link", { method: "POST" })
      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "No se pudo abrir el panel de Stripe")
      }

      window.open(data.url, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("[v0] Stripe login link error:", error)
      toast.error("No se pudo abrir el panel de Stripe", {
        description: error instanceof Error && error.message ? error.message : undefined,
      })
    } finally {
      setIsOpeningDashboard(false)
    }
  }

  const handleDisconnectStripe = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch("/api/connect/oauth/disconnect", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo desconectar la cuenta")
      }

      setStripeStatus({ accountId: null, accountType: null, onboardingComplete: false })
      toast.success("Cuenta Stripe desconectada")
    } catch (error) {
      console.error("[v0] Stripe disconnect error:", error)
      toast.error("No se pudo desconectar la cuenta", {
        description: error instanceof Error && error.message ? error.message : undefined,
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleSavePaypalEmail = async () => {
    setIsSavingPaypal(true)
    try {
      const result = await setPayPalPayoutMethod(paypalEmailInput)
      if (!result.success) {
        throw new Error(result.error || "No se pudo guardar tu correo de PayPal")
      }
      setPayoutMethod("paypal")
      setPaypalEmail(paypalEmailInput.trim())
      toast.success("PayPal configurado", {
        description: "A partir de ahora recibirás tus pagos por PayPal.",
      })
    } catch (error) {
      toast.error("No se pudo guardar tu correo de PayPal", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSavingPaypal(false)
    }
  }

  const handleSwitchToStripe = async () => {
    setIsSwitchingToStripe(true)
    try {
      const result = await setStripePayoutMethod()
      if (!result.success) {
        throw new Error(result.error || "No se pudo cambiar el método de cobro")
      }
      setPayoutMethod("stripe")
      toast.success("Método de cobro actualizado a Stripe")
    } catch (error) {
      toast.error("No se pudo cambiar a Stripe", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSwitchingToStripe(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                    src="/univvy-logo.png"
                    alt="Univvy"
                    className="h-10 w-auto"
                  />
                </Link>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Mi Billetera</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
            <p className="text-gray-600">Cargando billetera...</p>
          </div>
        </main>
      </div>
    )
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
                <CardTitle className="text-3xl">{formatPrice(walletData.availableBalance)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-red-600 hover:bg-red-50"
                      disabled={walletData.availableBalance === 0}
                    >
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
                          Disponible: {formatPrice(walletData.availableBalance)}
                        </p>
                      </div>
                      {walletData.bankAccount ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{walletData.bankAccount.bank}</p>
                              <p className="text-sm text-gray-500">
                                Cuenta {walletData.bankAccount.accountNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <p className="text-sm text-yellow-700">
                            Debes configurar una cuenta bancaria para poder retirar fondos.
                          </p>
                        </div>
                      )}
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
                        disabled={isWithdrawing || !withdrawAmount || !walletData.bankAccount}
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
                  {formatPrice(walletData.escrowBalance)}
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
                <CardTitle className="text-2xl text-green-600">{formatPrice(walletData.totalEarnings)}</CardTitle>
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
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
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
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium mb-2">Sin transacciones</p>
                      <p className="text-sm">Tus transacciones aparecerán aquí cuando comiences a dar asesorías.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="income" className="space-y-4">
                  {transactions.filter((tx) => tx.type === "income").length > 0 ? (
                    transactions
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
                      ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ArrowDownLeft className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium">Sin ingresos registrados</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="withdrawals" className="space-y-4">
                  {transactions.filter((tx) => tx.type === "withdrawal").length > 0 ? (
                    transactions
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
                      ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ArrowUpRight className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium">Sin retiros registrados</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Payout Method Settings */}
          <Card className="border-gray-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cuenta de Pagos
              </CardTitle>
              <CardDescription>Elige cómo quieres recibir tus ganancias: Stripe o PayPal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Button
                  variant={payoutMethod === "stripe" ? "default" : "outline"}
                  className={payoutMethod === "stripe" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                  onClick={handleSwitchToStripe}
                  disabled={payoutMethod === "stripe" || isSwitchingToStripe || !stripeStatus.accountId}
                >
                  {isSwitchingToStripe ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Stripe
                  {payoutMethod === "stripe" && (
                    <Badge className="ml-2 bg-white/20 text-white hover:bg-white/20">Activo</Badge>
                  )}
                </Button>
                <Button
                  variant={payoutMethod === "paypal" ? "default" : "outline"}
                  className={payoutMethod === "paypal" ? "bg-[#0070ba] hover:bg-[#005ea6] text-white" : ""}
                  onClick={() => setPayoutMethod("paypal")}
                  disabled={isSavingPaypal}
                >
                  PayPal
                  {payoutMethod === "paypal" && (
                    <Badge className="ml-2 bg-white/20 text-white hover:bg-white/20">Activo</Badge>
                  )}
                </Button>
              </div>

              {payoutMethod === "paypal" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypal-email">Correo de PayPal</Label>
                    <Input
                      id="paypal-email"
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={paypalEmailInput}
                      onChange={(e) => setPaypalEmailInput(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Enviaremos tus ganancias a este correo usando PayPal Payouts.
                    </p>
                  </div>
                  {paypalEmail && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      PayPal conectado con {paypalEmail}
                    </div>
                  )}
                  <Button
                    className="bg-[#0070ba] hover:bg-[#005ea6] text-white"
                    onClick={handleSavePaypalEmail}
                    disabled={isSavingPaypal || !paypalEmailInput.trim()}
                  >
                    {isSavingPaypal ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {paypalEmail ? "Actualizar correo de PayPal" : "Guardar y activar PayPal"}
                  </Button>
                </div>
              ) : stripeStatus.accountId && stripeStatus.onboardingComplete ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      <Building className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Cuenta Stripe conectada
                      </p>
                      <p className="text-sm text-gray-500">
                        {stripeStatus.accountType === "standard" ? "Cuenta existente vinculada" : "Cuenta creada con Univvy"} - lista para recibir pagos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleOpenStripeDashboard} disabled={isOpeningDashboard}>
                      {isOpeningDashboard ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      )}
                      Ver panel de Stripe
                    </Button>
                    {stripeStatus.accountType === "standard" && (
                      <Button variant="ghost" onClick={handleDisconnectStripe} disabled={isDisconnecting}>
                        {isDisconnecting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Unlink className="mr-2 h-4 w-4" />
                        )}
                        Desconectar
                      </Button>
                    )}
                  </div>
                </div>
              ) : stripeStatus.accountId && !stripeStatus.onboardingComplete ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <p className="font-medium mb-2 text-gray-900">Verificación pendiente</p>
                  <p className="text-sm mb-4">
                    {stripeStatus.accountType === "standard"
                      ? "Tu cuenta Stripe está conectada pero aún necesita completar información en su Dashboard."
                      : "Aún necesitas completar tu configuración con Stripe para poder cobrar."}
                  </p>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={stripeStatus.accountType === "standard" ? handleOpenStripeDashboard : handleAddBankAccount}
                    disabled={isConnectingBank || isOpeningDashboard}
                  >
                    {isConnectingBank || isOpeningDashboard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {stripeStatus.accountType === "standard" ? "Completar en Stripe" : "Continuar configuración"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium mb-2 text-gray-900">Sin cuenta de pagos configurada</p>
                  <p className="text-sm mb-4">Conecta una cuenta Stripe que ya tengas o crea una nueva para poder retirar tus ganancias.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleConnectExistingStripe}
                      disabled={isConnectingExisting || isConnectingBank}
                    >
                      {isConnectingExisting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="mr-2 h-4 w-4" />
                      )}
                      Ya tengo cuenta Stripe
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleAddBankAccount}
                      disabled={isConnectingBank || isConnectingExisting}
                    >
                      {isConnectingBank ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Abriendo configuración...
                        </>
                      ) : (
                        "Crear cuenta nueva"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
