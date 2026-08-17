"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { uploadAvatar } from "@/app/actions/profile"

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId: string
  onAvatarChange?: (url: string) => void
}

export function AvatarUpload({ currentAvatarUrl, userId, onAvatarChange }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB")
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)

      const result = await uploadAvatar(formData)

      if (result.error) {
        toast.error(result.error)
        setPreview(null)
        return
      }

      if (result.url) {
        setPreview(null)
        onAvatarChange?.(result.url)
        toast.success("Foto de perfil actualizada")
      }
    } catch (error) {
      console.error("[v0] Avatar upload error:", error)
      toast.error("Error al subir la foto")
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const displayUrl = preview || currentAvatarUrl || "/avatar-universitario.svg"

  return (
    <div className="relative inline-block">
      <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-gray-200">
        <Image
          src={displayUrl}
          alt="Avatar"
          fill
          className="object-cover"
          priority
          unoptimized={preview ? true : false}
        />
      </div>

      {/* Upload button overlay */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
        type="button"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Camera className="h-5 w-5" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        aria-label="Subir foto de perfil"
      />

      {preview && (
        <button
          onClick={() => setPreview(null)}
          className="absolute -top-2 -right-2 p-1 bg-gray-700 hover:bg-gray-800 text-white rounded-full"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
