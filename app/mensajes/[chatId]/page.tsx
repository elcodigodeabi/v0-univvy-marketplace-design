"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { sendMessage, sendFileMessage, getChatWithMessages } from "@/app/actions/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Send, Paperclip, FileText, Image as ImageIcon,
  File, Clock, Lock, AlertTriangle, X
} from "lucide-react"

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string | null
  message_type: string
  file_url: string | null
  file_name: string | null
  file_size: number | null
  is_censored: boolean
  created_at: string
  sender: { id: string; full_name: string; avatar_url: string | null } | null
}

interface Chat {
  id: string
  booking_id: string
  is_active: boolean
  opens_at: string
  closes_at: string
  student_id: string
  advisor_id: string
  student: { id: string; full_name: string; avatar_url: string | null } | null
  advisor: { id: string; full_name: string; avatar_url: string | null } | null
  bookings: { id: string; subject: string; scheduled_at: string; duration_minutes: number } | null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Finalizado"
  const totalSecs = Math.floor(ms / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  if (h > 0) return `${h}h ${m}m restantes`
  if (m > 0) return `${m}m ${s}s restantes`
  return `${s}s restantes`
}

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.chatId as string

  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [inputText, setInputText] = useState("")
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<string>("")
  const [isClosed, setIsClosed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Load initial data
  useEffect(() => {
    async function load() {
      const result = await getChatWithMessages(chatId)
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      setChat(result.chat as Chat)
      setMessages(result.messages as Message[])
      setCurrentUserId(result.currentUserId ?? null)
      setIsClosed(!result.chat?.is_active)
      setLoading(false)
    }
    load()
  }, [chatId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Fetch with sender info
          const { data } = await supabase
            .from("chat_messages")
            .select(`
              id, chat_id, sender_id, content, message_type,
              file_url, file_name, file_size, is_censored, created_at,
              sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)
            `)
            .eq("id", payload.new.id)
            .single()
          if (data) {
            setMessages((prev) => {
              if (prev.find((m) => m.id === data.id)) return prev
              return [...prev, data as Message]
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatId])

  // Scroll on new messages
  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Countdown timer
  useEffect(() => {
    if (!chat) return
    const tick = () => {
      const now = Date.now()
      const closes = new Date(chat.closes_at).getTime()
      const diff = closes - now
      if (diff <= 0) {
        setIsClosed(true)
        setCountdown("Finalizado")
      } else {
        setCountdown(formatCountdown(diff))
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [chat])

  const handleSend = async () => {
    if (!inputText.trim() || sending || isClosed) return
    setSending(true)
    setError(null)
    const result = await sendMessage(chatId, inputText.trim())
    if (result.error) setError(result.error)
    else setInputText("")
    setSending(false)
  }

  const handleFileUpload = async () => {
    if (!selectedFile || uploading || isClosed) return
    setUploading(true)
    setError(null)
    const fd = new FormData()
    fd.append("file", selectedFile)
    const result = await sendFileMessage(chatId, fd)
    if (result.error) setError(result.error)
    else setSelectedFile(null)
    setUploading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const otherUser = currentUserId === chat?.student_id ? chat?.advisor : chat?.student

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error && !chat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>Volver</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shadow-sm">
        <Link href="/mensajes">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={otherUser?.avatar_url ?? undefined} />
          <AvatarFallback>{otherUser?.full_name?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{otherUser?.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">{chat?.bookings?.subject}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isClosed ? (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Lock className="h-3 w-3" />
              Chat cerrado
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1 text-xs text-amber-600 border-amber-300 bg-amber-50">
              <Clock className="h-3 w-3" />
              {countdown}
            </Badge>
          )}
        </div>
      </div>

      {/* Session info bar */}
      <div className="px-4 py-2 bg-muted/40 border-b text-xs text-muted-foreground text-center">
        Sesión: {chat?.bookings?.subject} &middot; {chat?.bookings?.scheduled_at
          ? new Date(chat.bookings.scheduled_at).toLocaleString("es-ES", {
              weekday: "short", day: "numeric", month: "short",
              hour: "2-digit", minute: "2-digit"
            })
          : ""}
        {" "}&middot; {chat?.bookings?.duration_minutes} min
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <p className="text-sm">No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
              {!isOwn && (
                <Avatar className="h-7 w-7 shrink-0 mt-1">
                  <AvatarImage src={msg.sender?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{msg.sender?.full_name?.[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] space-y-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                {/* System message */}
                {msg.message_type === "system" && (
                  <div className="bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground text-center w-full">
                    {msg.content}
                  </div>
                )}

                {/* Censored message */}
                {msg.message_type === "censored" && (
                  <div className={`rounded-2xl px-3 py-2 text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-400" />
                      <span className="italic text-xs opacity-80">{msg.content}</span>
                    </div>
                  </div>
                )}

                {/* Text message */}
                {msg.message_type === "text" && (
                  <div className={`rounded-2xl px-3 py-2 text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.content}
                  </div>
                )}

                {/* Image */}
                {msg.message_type === "image" && msg.file_url && (
                  <div className={`rounded-2xl overflow-hidden ${isOwn ? "bg-primary" : "bg-muted"}`}>
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={msg.file_url}
                        alt={msg.file_name ?? "imagen"}
                        className="max-w-[240px] max-h-[200px] object-cover rounded-2xl"
                      />
                    </a>
                  </div>
                )}

                {/* PDF / Document */}
                {(msg.message_type === "pdf" || msg.message_type === "document") && msg.file_url && (
                  <a
                    href={msg.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:opacity-80 transition-opacity ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {msg.message_type === "pdf"
                      ? <FileText className="h-4 w-4 shrink-0" />
                      : <File className="h-4 w-4 shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="truncate max-w-[160px] font-medium text-xs">{msg.file_name}</p>
                      {msg.file_size && (
                        <p className="text-xs opacity-70">{formatFileSize(msg.file_size)}</p>
                      )}
                    </div>
                  </a>
                )}

                <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error bar */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="mx-4 mb-2 flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm">
          {selectedFile.type.startsWith("image/")
            ? <ImageIcon className="h-4 w-4 text-blue-500" />
            : <FileText className="h-4 w-4 text-red-500" />
          }
          <span className="flex-1 truncate text-xs">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
          <Button size="sm" variant="default" className="h-7 text-xs" onClick={handleFileUpload} disabled={uploading}>
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
          <button onClick={() => setSelectedFile(null)}>
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Input */}
      {isClosed ? (
        <div className="px-4 py-4 border-t bg-muted/30 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Lock className="h-4 w-4" />
            <span>El chat se ha cerrado al finalizar la sesión</span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t bg-card flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setSelectedFile(f)
              e.target.value = ""
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1"
            disabled={sending}
          />
          <Button
            size="icon"
            className="shrink-0 rounded-full"
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
