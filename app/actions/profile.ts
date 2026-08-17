"use server"

import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"

export async function uploadAvatar(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return { error: "Archivo o usuario no proporcionado" }
    }

    const allowedTypes = new Set(["image/png", "image/jpeg"])
    const allowedExtensions = new Set(["png", "jpg", "jpeg"])
    const extension = file.name.split(".").pop()?.toLowerCase() || ""

    if (!allowedTypes.has(file.type) || !allowedExtensions.has(extension)) {
      return { error: "Solo se permiten imágenes PNG, JPG o JPEG" }
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      return { error: "La imagen debe pesar entre 1 byte y 5MB" }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return { error: "No tienes permiso para actualizar este perfil" }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = extension
    const filename = `avatars/${userId}/${timestamp}.${ext}`

    // Upload to Blob Storage
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    if (!blob.url) {
      return { error: "Error al guardar la imagen" }
    }

    // Update profile in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: blob.url })
      .eq("id", userId)

    if (updateError) {
      console.error("[v0] Error updating profile avatar:", updateError)
      return { error: "Error al actualizar el perfil" }
    }

    return { url: blob.url }
  } catch (error) {
    console.error("[v0] Avatar upload error:", error)
    return { error: "Error al procesar la imagen" }
  }
}
