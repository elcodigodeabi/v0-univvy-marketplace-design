import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Accepts: multipart/form-data with a "file" field
// Returns: { url: string } — public URL of the uploaded proof
export async function POST(request: NextRequest) {
  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validate file type — only images and PDFs
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Use JPG, PNG, WEBP o PDF." },
        { status: 400 }
      )
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no puede superar 5 MB" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `transfer-proofs/${user.id}/${Date.now()}.${ext}`

    const blob = await put(fileName, file, { access: "public" })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[upload] Error:", error)
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
  }
}
