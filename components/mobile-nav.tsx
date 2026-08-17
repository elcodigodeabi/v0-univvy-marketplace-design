"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, CalendarDays, MessageSquare, Menu, X, UserRound, Settings, WalletCards } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const studentItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/mis-sesiones", label: "Sesiones", icon: CalendarDays },
  { href: "/mensajes", label: "Mensajes", icon: MessageSquare },
]

const advisorItems = [
  { href: "/dashboard-asesor", label: "Dashboard", icon: Home },
  { href: "/solicitudes-asesor", label: "Solicitudes", icon: CalendarDays },
  { href: "/mis-sesiones-asesor", label: "Sesiones", icon: CalendarDays },
  { href: "/mensajes", label: "Mensajes", icon: MessageSquare },
]

export function MobileNav({ variant = "student" }: { variant?: "student" | "advisor" }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const items = variant === "advisor" ? advisorItems : studentItems

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <nav className="mx-auto flex max-w-md items-center justify-around py-2" aria-label="Navegación móvil">
          {items.slice(0, 4).map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn("flex min-w-0 flex-1 flex-col items-center gap-1 py-1 text-xs", pathname === href ? "text-primary" : "text-muted-foreground")}>
              <Icon className="size-5" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Abrir menú">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">Menú</span>
          </Button>
        </nav>
      </div>
      {open && (
        <div className="fixed inset-x-3 bottom-20 z-50 rounded-xl border border-border bg-background p-2 shadow-lg md:hidden">
          <Link href="/perfil" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-muted"><UserRound className="size-4" /> Mi Perfil</Link>
          {variant === "advisor" && <>
            <Link href="/configuracion-asesor" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-muted"><Settings className="size-4" /> Configuración</Link>
            <Link href="/wallet" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-muted"><WalletCards className="size-4" /> Billetera</Link>
          </>}
        </div>
      )}
    </>
  )
}

export default MobileNav
