"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function RedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    // Check for recovery code in query params
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get("code")
    const type = searchParams.get("type")

    console.log("[v0] RedirectHandler - checking params:", { code: !!code, type, pathname: window.location.pathname, search: window.location.search })

    // If we're at the root and there's a code, redirect to recovery page
    if (code && window.location.pathname === "/") {
      console.log("[v0] Redirecting to /auth/recover with code")
      // Use replace to not add to history
      window.location.href = `/auth/recover?code=${code}${type ? `&type=${type}` : ""}`
    }
  }, [])

  return null
}
