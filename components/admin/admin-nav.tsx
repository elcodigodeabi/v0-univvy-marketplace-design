"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileWarning, ShieldCheck } from "lucide-react"

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/usuarios-roles", label: "Usuarios y Roles", icon: Users },
  { href: "/admin/reportes", label: "Reportes", icon: FileWarning },
]

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-red-600" />
            <span className="text-lg font-bold text-gray-900">Panel de Administración</span>
          </div>
          <span className="text-sm text-gray-500">{adminName}</span>
        </div>
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
