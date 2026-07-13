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

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split(".").pop() || "jpg"
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
    const supabase = await createClient()
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
