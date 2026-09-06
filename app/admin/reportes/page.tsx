"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Loader2, AlertCircle, FileWarning } from "lucide-react"
import { toast } from "sonner"
import { updateDisputeStatus, type DisputeResolutionStatus } from "@/app/actions/admin-disputes"

interface Dispute {
  id: string
  booking_id: string
  reason: string
  evidence_urls: string[] | null
  status: "open" | "under_review" | "resolved_student" | "resolved_advisor" | "closed"
  admin_notes: string | null
  resolution: string | null
  resolved_at: string | null
  created_at: string
  booking: { id: string; subject: string; session_date: string; session_time: string; status: string } | null
  raiser: { id: string; full_name: string; email: string; role: string } | null
  student: { id: string; full_name: string; email: string } | null
  advisor: { id: string; full_name: string; email: string } | null
}

const STATUS_LABELS: Record<Dispute["status"], string> = {
  open: "Abierto",
  under_review: "En revisión",
  resolved_student: "Resuelto a favor del alumno",
  resolved_advisor: "Resuelto a favor del asesor",
  closed: "Cerrado",
}

const STATUS_VARIANT: Record<Dispute["status"], string> = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  under_review: "bg-blue-100 text-blue-800 border-blue-200",
  resolved_student: "bg-green-100 text-green-800 border-green-200",
  resolved_advisor: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
}

export default function ReportesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"todos" | Dispute["status"]>("todos")
  const [selected, setSelected] = useState<Dispute | null>(null)
  const [notes, setNotes] = useState("")
  const [resolutionStatus, setResolutionStatus] = useState<DisputeResolutionStatus>("under_review")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/disputes")
      if (!res.ok) throw new Error("Error al cargar reportes")
      const data = await res.json()
      setDisputes(data)
    } catch (err) {
      toast.error("Error al cargar reportes")
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (statusFilter === "todos") return disputes
    return disputes.filter((d) => d.status === statusFilter)
  }, [disputes, statusFilter])

  const openCount = disputes.filter((d) => d.status === "open").length

  const openDialog = (dispute: Dispute) => {
    setSelected(dispute)
    setNotes(dispute.admin_notes || "")
    setResolutionStatus(
      dispute.status === "open" ? "under_review" : (dispute.status as DisputeResolutionStatus)
    )
  }

  const handleSave = async () => {
    if (!selected) return
    setIsSaving(true)
    try {
      const result = await updateDisputeStatus({
        disputeId: selected.id,
        status: resolutionStatus,
        adminNotes: notes,
      })
      if (result.error) throw new Error(result.error)
      toast.success("Reporte actualizado")
      setSelected(null)
      fetchDisputes()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar el reporte")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bandeja de Reportes</h1>
          <p className="text-sm text-gray-600">Disputas abiertas por alumnos y asesores sobre sus sesiones</p>
        </div>
        {openCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">
            {openCount} pendiente{openCount === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filtrar por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los reportes</SelectItem>
              <SelectItem value="open">Abiertos</SelectItem>
              <SelectItem value="under_review">En revisión</SelectItem>
              <SelectItem value="resolved_student">Resueltos (alumno)</SelectItem>
              <SelectItem value="resolved_advisor">Resueltos (asesor)</SelectItem>
              <SelectItem value="closed">Cerrados</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileWarning className="mb-2 h-8 w-8" />
            <p>No hay reportes para este filtro</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((dispute) => (
            <Card key={dispute.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => openDialog(dispute)}>
              <CardContent className="pt-6">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {dispute.booking?.subject || "Sesión sin materia"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Reportado por {dispute.raiser?.full_name || "Usuario"} ({dispute.raiser?.role || "—"}) ·{" "}
                      {new Date(dispute.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <Badge variant="outline" className={STATUS_VARIANT[dispute.status]}>
                    {STATUS_LABELS[dispute.status]}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-gray-700">{dispute.reason}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>Alumno: {dispute.student?.full_name || "—"}</span>
                  <span>Asesor: {dispute.advisor?.full_name || "—"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Revisar reporte</DialogTitle>
            <DialogDescription>{selected?.booking?.subject || "Sesión"}</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-gray-500">Motivo reportado</p>
                <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-800">{selected.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Alumno</p>
                  <p>{selected.student?.full_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Asesor</p>
                  <p>{selected.advisor?.full_name || "—"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-gray-500">Nuevo estado</p>
                <Select value={resolutionStatus} onValueChange={(v) => setResolutionStatus(v as DisputeResolutionStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_review">En revisión</SelectItem>
                    <SelectItem value="resolved_student">Resolver a favor del alumno</SelectItem>
                    <SelectItem value="resolved_advisor">Resolver a favor del asesor</SelectItem>
                    <SelectItem value="closed">Cerrar sin acción</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-gray-500">Notas internas</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles de la revisión, evidencia considerada, próximos pasos..."
                  rows={4}
                />
              </div>

              <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Esta acción solo actualiza el estado del reporte y notifica a ambas partes. No libera ni reembolsa
                  pagos automáticamente.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
