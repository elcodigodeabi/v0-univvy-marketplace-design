import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getAdminUser } from "@/lib/auth/require-admin"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser()

  if (!admin) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav adminName={admin.full_name || admin.email} />
      {children}
    </div>
  )
}
