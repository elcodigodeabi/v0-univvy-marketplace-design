"use client"

import { useState, useTransition } from "react"
import { Star, Flag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { submitAdvisorReport, submitReview, REPORT_REASON_OPTIONS } from "@/app/actions/reviews"
import { toast } from "sonner"

export function SessionFeedbackDialog({ bookingId, advisorName, reported = false }: { bookingId: string; advisorName: string; reported?: boolean }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [isPending, startTransition] = useTransition()

  const saveReview = () => startTransition(async () => {
    try { await submitReview({ bookingId, rating, comment }); toast.success("Tu calificación fue guardada"); setOpen(false) }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar") }
  })
  const saveReport = () => startTransition(async () => {
    try { await submitAdvisorReport({ bookingId, reason, details }); toast.success("Reporte enviado al equipo de Univvy"); setOpen(false) }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo enviar") }
  })

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" className="border-gray-300 bg-transparent" disabled={reported}><Flag className="h-4 w-4 mr-2" />{reported ? "Reporte enviado" : "Reportar"}</Button></DialogTrigger><DialogContent>
    <DialogHeader><DialogTitle>Seguridad y valoración</DialogTitle><DialogDescription>Tu experiencia con {advisorName} ayuda a mantener Univvy seguro.</DialogDescription></DialogHeader>
    <div className="space-y-5">
      <div><Label>Califica la sesión</Label><div className="flex gap-2 mt-2" role="radiogroup" aria-label="Calificación de 1 a 5 estrellas">{[1,2,3,4,5].map(value => <button key={value} type="button" aria-label={`${value} estrellas`} onClick={() => setRating(value)}><Star className={`h-8 w-8 ${value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} /></button>)}</div></div>
      <Textarea placeholder="Comentario opcional sobre tu experiencia" value={comment} onChange={e => setComment(e.target.value)} />
      <Button onClick={saveReview} disabled={rating === 0 || isPending} className="w-full bg-red-600 hover:bg-red-700">{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Guardar calificación</Button>
      <div className="border-t pt-4 space-y-3"><Label>¿Necesitas reportar al asesor?</Label><Select value={reason} onValueChange={setReason}><SelectTrigger><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger><SelectContent>{REPORT_REASON_OPTIONS.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select><Textarea placeholder="Explica lo ocurrido (mínimo 10 caracteres)" value={details} onChange={e => setDetails(e.target.value)} /><DialogFooter><Button variant="destructive" onClick={saveReport} disabled={!reason || details.trim().length < 10 || isPending}>Enviar reporte</Button></DialogFooter></div>
    </div>
  </DialogContent></Dialog>
}

export function RatingStars({ value, count }: { value: number; count?: number }) { return <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-semibold">{value.toFixed(1)}</span>{typeof count === "number" && <span className="text-sm text-gray-500">({count})</span>}</span> }
