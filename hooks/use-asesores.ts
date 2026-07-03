"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface AvailabilitySlot {
  start: string
  end: string
}

export interface DayAvailability {
  enabled: boolean
  slots: AvailabilitySlot[]
}

export interface Asesor {
  id: string
  nombre: string
  email: string
  especialidades: string[]
  universidad: string
  carrera: string
  rating: number
  sesiones_completadas: number
  precio_por_hora: number
  modalidad: string[]
  disponibilidad: Record<string, DayAvailability> | null
  descripcion: string
  avatar_url: string | null
  created_at: string
}

export function useAsesores() {
  const [asesores, setAsesores] = useState<Asesor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAsesores() {
      const supabase = createClient()
      
      try {
        console.log("[v0] Fetching asesores...")
        
        // Try to fetch from profiles table where role is 'asesor'
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "asesor")
          .order("created_at", { ascending: false })

        console.log("[v0] Fetch result - error:", fetchError, "data:", data)

        if (fetchError) {
          console.error("[v0] Error fetching asesores:", fetchError.message)
          setError(fetchError.message)
          setAsesores([])
        } else if (!data) {
          console.log("[v0] No data returned")
          setAsesores([])
        } else {
          // Map the data to our Asesor interface
          const mappedAsesores: Asesor[] = (data || []).map((profile: any) => {
            console.log("[v0] Mapping profile:", profile.id, profile.full_name)
            return {
              id: profile.id,
              nombre: profile.full_name || profile.nombre || "Sin nombre",
              email: profile.email || "",
              especialidades: Array.isArray(profile.especialidades) ? profile.especialidades : [],
              universidad: profile.universidad || "Sin universidad",
              carrera: profile.carrera || "Sin carrera",
              rating: Number(profile.rating) || 0,
              sesiones_completadas: Number(profile.sesiones_completadas) || 0,
              precio_por_hora: Number(profile.precio_por_hora) || 0,
              modalidad: Array.isArray(profile.modalidad) ? profile.modalidad : [],
              disponibilidad: profile.disponibilidad || null,
              descripcion: profile.bio || profile.descripcion || "",
              avatar_url: profile.avatar_url || null,
              created_at: profile.created_at,
            }
          })
          console.log("[v0] Mapped asesores:", mappedAsesores.length)
          setAsesores(mappedAsesores)
        }
      } catch (err: any) {
        console.error("[v0] Exception fetching asesores:", err?.message || err)
        setError(err?.message || "Error al cargar asesores")
        setAsesores([])
      } finally {
        setLoading(false)
      }
    }

    fetchAsesores()
  }, [])

  return { asesores, loading, error }
}

export function useAsesor(id: string) {
  const [asesor, setAsesor] = useState<Asesor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAsesor() {
      if (!id) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      
      try {
        console.log("[v0] Fetching asesor:", id)
        
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .eq("role", "asesor")
          .single()

        console.log("[v0] Asesor fetch result - error:", fetchError, "data:", data)

        if (fetchError) {
          console.error("[v0] Error fetching asesor:", fetchError.message)
          setError(fetchError.message)
          setAsesor(null)
        } else if (data) {
          setAsesor({
            id: data.id,
            nombre: data.full_name || data.nombre || "Sin nombre",
            email: data.email || "",
            especialidades: Array.isArray(data.especialidades) ? data.especialidades : [],
            universidad: data.universidad || "Sin universidad",
            carrera: data.carrera || "Sin carrera",
            rating: Number(data.rating) || 0,
            sesiones_completadas: Number(data.sesiones_completadas) || 0,
            precio_por_hora: Number(data.precio_por_hora) || 0,
            modalidad: Array.isArray(data.modalidad) ? data.modalidad : [],
            disponibilidad: data.disponibilidad || null,
            descripcion: data.bio || data.descripcion || "",
            avatar_url: data.avatar_url || null,
            created_at: data.created_at,
          })
        }
      } catch (err: any) {
        console.error("[v0] Exception fetching asesor:", err?.message || err)
        setError(err?.message || "Error al cargar asesor")
        setAsesor(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAsesor()
  }, [id])

  return { asesor, loading, error }
}
