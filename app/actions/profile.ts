"use server"

import { createClient } from "@/lib/supabase/server"

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

    // Generate unique filename (folder = userId, required by storage RLS policies)
    const timestamp = Date.now()
    const filePath = `${userId}/${timestamp}.${extension}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("[v0] Error uploading avatar to storage:", uploadError)
      return { error: "Error al guardar la imagen" }
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl
    if (!publicUrl) {
      return { error: "Error al obtener la URL de la imagen" }
    }

    // Update profile in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId)

    if (updateError) {
      console.error("[v0] Error updating profile avatar:", updateError)
      return { error: "Error al actualizar el perfil" }
    }

    return { url: publicUrl }
  } catch (error) {
    console.error("[v0] Avatar upload error:", error)
    return { error: "Error al procesar la imagen" }
  }
}
