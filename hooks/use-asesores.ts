"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

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
  disponibilidad: string
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
        // Try to fetch from profiles table where role is 'asesor'
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "asesor")
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.log("[v0] Error fetching asesores:", fetchError.message)
          setError(fetchError.message)
          setAsesores([])
        } else {
          // Map the data to our Asesor interface
          const mappedAsesores: Asesor[] = (data || []).map((profile: any) => ({
            id: profile.id,
            nombre: profile.full_name || profile.nombre || "Sin nombre",
            email: profile.email || "",
            especialidades: profile.especialidades || [],
            universidad: profile.universidad || "Sin universidad",
            carrera: profile.carrera || "Sin carrera",
            rating: profile.rating || 0,
            sesiones_completadas: profile.sesiones_completadas || 0,
            precio_por_hora: profile.precio_por_hora || 0,
            modalidad: profile.modalidad || [],
            disponibilidad: profile.disponibilidad || "",
            descripcion: profile.descripcion || "",
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
          }))
          setAsesores(mappedAsesores)
        }
      } catch (err) {
        console.log("[v0] Exception fetching asesores:", err)
        setError("Error al cargar asesores")
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
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .eq("role", "asesor")
          .single()

        if (fetchError) {
          console.log("[v0] Error fetching asesor:", fetchError.message)
          setError(fetchError.message)
          setAsesor(null)
        } else if (data) {
          setAsesor({
            id: data.id,
            nombre: data.full_name || data.nombre || "Sin nombre",
            email: data.email || "",
            especialidades: data.especialidades || [],
            universidad: data.universidad || "Sin universidad",
            carrera: data.carrera || "Sin carrera",
            rating: data.rating || 0,
            sesiones_completadas: data.sesiones_completadas || 0,
            precio_por_hora: data.precio_por_hora || 0,
            modalidad: data.modalidad || [],
            disponibilidad: data.disponibilidad || "",
            descripcion: data.descripcion || "",
            avatar_url: data.avatar_url,
            created_at: data.created_at,
          })
        }
      } catch (err) {
        console.log("[v0] Exception fetching asesor:", err)
        setError("Error al cargar asesor")
      } finally {
        setLoading(false)
      }
    }

    fetchAsesor()
  }, [id])

  return { asesor, loading, error }
}
